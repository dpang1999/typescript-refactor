import { JsxAttribute, ObjectLiteralExpression, Project, PropertyAssignment, ts } from "ts-morph"
import * as readline from 'readline';
console.log("hello Stephen")
const project = new Project({
    tsConfigFilePath:"/workspaces/typescript-refactor/refactor-cli/cs842website/tsconfig.json",
})
const sourceFiles = project.getSourceFiles()
const colorCount = new Map()
const colorRegex = /\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\]/g; // matches hex colors in the format [#FFFFFF] or [#FFF]
for (const sourceFile of sourceFiles){
    const classNames = sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="className")
    //console.log(classNames.map(c=>c.getText()))
    for (const className of classNames){
        let matches
        while (matches = colorRegex.exec(className.getText())){
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
    }
    await sourceFile.save()
}

//console.log("color count")
const colourTranslation = new Map()
const rl = readline.createInterface({
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
            while (Array.from(colourTranslation.values()).includes(translation) && (answer === 'y') {
                console.log('This translation already exists. Please try again.')
                answer = await askQuestion('Do you want to translate this colour? (y/n): ')
                if (answer === 'y') 
                    translation = await askQuestion('What should this colour be translated to? ')
            }
            colourTranslation.set(key,translation)
 
        }
    }
    rl.close()
    // for (const [key, value] of colourTranslation) {
    //     console.log(`${key}: ${value}`);
    //     // key-value pair is original-translation
    // }
    
}


function configAddProp(obj: ObjectLiteralExpression, identifier: string): PropertyAssignment {
    return obj.addPropertyAssignment({name: identifier, initializer: "{\n},"})
}
const updateConfig = async () => {
    const config = project.getSourceFile("/workspaces/typescript-refactor/refactor-cli/cs842website/tailwind.config.ts")
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
    for(const [key, value] of colourTranslation)
        if (spot?.getDescendants().filter(j=>j.getText()===`"${value}"`).length===0)
            spot?.addPropertyAssignment({name:`"${value}"`,initializer:`"${key}"`})
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

const main = async () => {
    await processColours()
    await updateConfig()
    await updateColours()
}
main()