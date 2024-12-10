import { JsxAttribute, JsxElement, ObjectLiteralExpression, Project, PropertyAssignment, ts } from "ts-morph"
import * as readLine from "readline"


const project = new Project({
    tsConfigFilePath:"/workspaces/typescript-refactor/cs842website/tsconfig.json",
})
const sourceFiles = project.getSourceFiles().filter(sourceFile => !sourceFile.getFilePath().includes('/components/'));
const colorCount = new Map()
const fontCount = new Map()
let cardCount: JsxElement[] = []
const colorRegex = /\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]/g; // matches hex colors in the format [#FFFFFF] or [#FFF]
const fontFamilyRegex = /font-\[([^\]]+)\]/g; // matches font-family classes 
const cardRegex = /(?=.*\brounded\b)(?=.*\bborder\b)(?=.*\b(padding|p-\d+|p-\[\d+px\])\b)(?=.*\b(bg|background)\b).*/g; //matches cards
for (const sourceFile of sourceFiles){
    const classNames = sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="className")
    const cardDivs = sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxElement).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.JsxClosingElement)?.getText()==="</div>")
    for (const className of classNames){
        let matches
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
        let matches
        let cardOpening = cardDiv.getFirstChildByKind(ts.SyntaxKind.JsxOpeningElement)
        if (matches = cardRegex.exec(cardOpening!.getText())){ // searching only for card classes where opening div matches
            cardCount.push(cardDiv)
        }
        await sourceFile.save()
    }
}



//console.log("color count")
const colourTranslation = new Map()
const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})
const askQuestion = (question: string): Promise<string> => {
    return new Promise((resolve) => rl.question(question, resolve))
}

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
    rl.close()   
}

const fontTranslation = new Map()
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
    rl.close()
}



function configAddProp(obj: ObjectLiteralExpression, identifier: string): PropertyAssignment {
    return obj.addPropertyAssignment({name: identifier, initializer: "{\n},"})
}
// TODO: update font
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
    console.log(theme.getText())
    await config!.save()    
}

const updateColours = async () => {
    for (const [key, value] of colourTranslation){
        for (const node of colorCount.get(key)){
            node.replaceWithText(node.getText().replace(key,value))
        }
    }
    await project.save()
}

const updateFonts = async () => {
    for (const [key, value] of fontTranslation){
        for (const node of fontCount.get(key)){
            node.replaceWithText(node.getText().replace(key,`font-"${value}"`))
        }
    }
    await project.save()
}

const updateCards = async () => {
    for (const div of cardCount){
            div.replaceWithText(div.getText().replace("div","Card"))
    }
}

const main = async () => {
    //await processColours()
    //await updateConfig()
    //await updateColours()
}
main()