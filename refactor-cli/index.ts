import { JsxAttribute, ObjectLiteralExpression, Project, PropertyAssignment, ts } from "ts-morph"

console.log("hello Stephen")
const project = new Project({
    tsConfigFilePath:"/workspaces/typescript-refactor/refactor-cli/cs842website/tsconfig.json",
})
// const sourceFiles = project.getSourceFiles()
// for (const sourceFile of sourceFiles){
//     const classNames = sourceFile.getDescendantsOfKind(ts.SyntaxKind.JsxAttribute).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="className")
//     console.log(classNames.map(c=>c.getText()))
//     for (const className of classNames){
//         className.replaceWithText(className.getText().replace("[#FFFFFF]","white"))
//     }
//     await sourceFile.save()
// }
function configAddProp(obj: ObjectLiteralExpression, identifier: string): PropertyAssignment {
    return obj.addPropertyAssignment({name: identifier, initializer: "{\n},"})
}
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
const colorsToAdd = new Map();
// dummy data
colorsToAdd.set("[#FFFFFF]","white")
colorsToAdd.set("[#000000]","black")
const spot = colors.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
for(const [key, value] of colorsToAdd)
{
    spot?.addPropertyAssignment({name:`"${value}"`,initializer:`"${key}"`})

}
console.log(theme.getText())
await config!.save()