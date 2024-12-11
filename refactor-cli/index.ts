import { JsxAttribute, JsxElement, ObjectLiteralExpression, Project, PropertyAssignment, SourceFile, ts } from "ts-morph"
import * as readLine from "readline"


const project = new Project({
    tsConfigFilePath:"/workspaces/typescript-refactor/cs842website/tsconfig.json",
})
const sourceFiles = project.getSourceFiles().filter(sourceFile => !sourceFile.getFilePath().includes('/components/'));
const colorCount = new Map() //saves key to list of AST nodes that use that colour
const fontCount = new Map() //saves key to list of AST nodes that use that font
let cardCount: JsxElement[] = [] //saves list of AST nodes that need to be replaced by cards
let cardFiles = new Set<SourceFile>() // mark source files that may need Card import

for (const sourceFile of sourceFiles){
    const classNames = sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="className")
    const cardDivs = sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxElement).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.JsxClosingElement)?.getText()==="</div>")
    for (const className of classNames){
        let matches
        const fontFamilyRegex = /font-\[([^\]]+)\]/g // matches font-family classes 
        const colorRegex = /\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]/g // matches hex colors in the format [#FFFFFF] or [#FFF]
        while (matches = colorRegex.exec(className.getText())){ // searching for colours
            const color = matches[0]
            if (colorCount.has(color)){
                let nodes = colorCount.get(color)
                nodes.push(className)
                colorCount.set(color,nodes)
            }
            else{
                colorCount.set(color,[className])
            }   
        }       
        while (matches = fontFamilyRegex.exec(className.getText())){ // searching for font families
            const fontFamily = matches[0]
            if (fontCount.has(fontFamily)){
                let nodes = fontCount.get(fontFamily)
                nodes.push(className)
                fontCount.set(fontFamily,nodes)
            }
            else{
                fontCount.set(fontFamily,[className])
            }
        }
        await sourceFile.save()
    }

    for(const cardDiv of cardDivs){
        const cardRegex = /(?=.*\brounded\b)(?=.*\bborder\b)(?=.*\b(padding|p-\d+|p-\[\d+px\])\b)(?=.*\b(bg|background)\b).*/g; //matches cards
        //cards being any div that has rounded, border, padding, and background
        //very importantly, cards add text-card-foreground and shadow-sm, but rounded, border, padding, and bg are overriden if possible
        let cardOpening = cardDiv.getFirstChildByKind(ts.SyntaxKind.JsxOpeningElement)
        if (cardRegex.exec(cardOpening!.getText())){ // searching for cards
            cardCount.push(cardDiv) 
            cardFiles.add(sourceFile)
        }
        await sourceFile.save()
    }
}

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})
const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => rl.question(question, resolve))
}

const colourTranslation = new Map() //maps colour to what you want to call it 
const processColours = async () => {
    for (const [key, value] of colorCount){
        console.log(key)
        console.log("Instances of this colour: " + value.length)
        let answer = await askQuestion('Do you want to translate this colour? (y/n): ')
        if (answer === 'y') {
            let translation = await askQuestion('What should this colour be translated to? ')
            while (Array.from(colourTranslation.values()).includes(translation) && (answer === 'y')) {
                console.log('This translation already exists. Please try again.')
                answer = await askQuestion('Do you want to translate this colour? (y/n): ')
                if (answer === 'y') 
                    translation = await askQuestion('What should this colour be translated to? ')
            }
            colourTranslation.set(key,translation)
 
        }
    }  
}

const fontTranslation = new Map() //maps font family to what you want to call it
const processFonts = async () => {
    for (const [key, value] of fontCount){
        console.log(key)
        console.log("Instances of this font: " + value.length)
        let answer = await askQuestion('Do you want to translate this font? (y/n): ')
        if (answer === 'y') {
            let translation = await askQuestion('What should this font be translated to? ')
            while (Array.from(fontTranslation.values()).includes(translation) && (answer === 'y')) {
                console.log('This translation already exists. Please try again.')
                answer = await askQuestion('Do you want to translate this font? (y/n): ')
                if (answer === 'y') 
                    translation = await askQuestion('What should this font be translated to? ')
            }
            fontTranslation.set(key,translation)
        }
    }
}

function configAddProp(obj: ObjectLiteralExpression, identifier: string): PropertyAssignment {
    return obj.addPropertyAssignment({name: identifier, initializer: "{\n},"})
}

//adds theme, extend, colors, and font family if it doesn't exist to the tailwind.config.ts file
//then adds the translations to the file
const updateConfig = async () => {
    const config = project.getSourceFile("/workspaces/typescript-refactor/cs842website/tailwind.config.ts")
    const exportHead = config?.getFirstChildByKind(ts.SyntaxKind.ExportAssignment)?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
    let theme = exportHead?.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="theme")?.[0]
    if (!theme){
        console.log("no theme")
        theme = configAddProp(exportHead!,"theme")
    }
    let extend = theme?.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="extend")?.[0]
    if(!extend){ 
        console.log("no extend")
        extend = configAddProp(theme.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)!,"extend")
    }
    let colors = extend?.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="colors")?.[0]
    if(!colors) {
        console.log("no colours")
        colors = configAddProp(extend.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)!,"colors")
    }
    const spot = colors.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
    for(const [key, value] of colourTranslation) {
        let colourHex = key.replace(/[\[\]]/g, '') //removing the square brackets
        if (spot?.getDescendants().filter(j=>j.getText()===`"${value}"`).length===0)
            spot?.addPropertyAssignment({name:`"${value}"`,initializer:`"${colourHex}"`})
    }

    let fontFamily = extend?.getDescendantsOfKind(ts.SyntaxKind.PropertyAssignment).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="fontFamily")?.[0]
    if(!fontFamily){
        console.log("no fontFamilies")
        fontFamily = configAddProp(extend.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)!,"fontFamily")
    }
    const fontSpot = fontFamily.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
    for(const [key, value] of fontTranslation) {
        const cleaned = key.replace(/font-/g, '').replace(/[\[\]]/g, '').replace(/['"]/g, '') //removing the square brackets, font-, and quotation marks
        const fontArray = cleaned.split(',').map(font => `'${font.trim()}'`);
        const fontFamily = `[${fontArray.join(', ')}]`
        if (fontSpot?.getDescendants().filter(j=>j.getText()===`"${value}"`).length===0)
            fontSpot?.addPropertyAssignment({name:`"${value}"`,initializer:fontFamily})
    }
    await config!.save()    
}

//goes through AST nodes replacing the ad-hoc colours with the variable in tailwind.config.ts
const updateColours = async () => {
    for (const [key, value] of colourTranslation){
        for (const node of colorCount.get(key)){
            node.replaceWithText(node.getText().replace(key,value))
        }
    }
    await project.save()
}

//goes through AST nodes replacing the ad-hoc font-family classes with the variable in tailwind.config.ts
const updateFonts = async () => {
    for (const [key, value] of fontTranslation){
        for (const node of fontCount.get(key)){
            node.replaceWithText(node.getText().replace(key,`font-${value}`))
        }
    }
    await project.save()
}

//goes through AST nodes replacing the divs that need to be replaced with the Card component
//also goes through the source files to add the Card import if it doesn't exist
const updateCards = async () => {
    for (const div of cardCount){
        const updatedText = div.getText()
                .replace(/<div\b([^>]*)>/g, '<Card$1>') // Replace opening <div ...> with <Card ...>
                .replace(/<\/div>/g, '</Card>') // Replace closing </div> with </Card>
        div.replaceWithText(updatedText)
    }
    for (const file of cardFiles){
        const imports = file.getImportDeclarations()
        let cardImportExists = false;

        for (const importDecl of imports) {
            const moduleSpecifier = importDecl.getModuleSpecifierValue();
            if (moduleSpecifier === '@/components/card' || moduleSpecifier === "'@/components/card'" || moduleSpecifier === '"@/components/card"') {
                const namedImports = importDecl.getNamedImports();
                const defaultImport = importDecl.getDefaultImport();
                if (defaultImport?.getText() === 'Card' || namedImports.some(namedImport => namedImport.getName() === 'Card')) {
                    cardImportExists = true;
                    break;
                }
            }
        }
        if (!cardImportExists){
            file.addImportDeclaration({
                moduleSpecifier: '@/components/card',
                defaultImport: "Card"
            })
        }
        await file.save()
    }
}

const main = async () => {
    await processColours()
    await processFonts()

    await updateColours()
    await updateFonts()
    await updateCards()

    await updateConfig()

    console.log("done")
    rl.close()
    
}
main()
