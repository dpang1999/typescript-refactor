import { JsxAttribute, Project, ts } from "ts-morph"

console.log("hello Stephen")
const project = new Project({
    tsConfigFilePath:"/workspaces/typescript-refactor/cs842website/tsconfig.json",
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

const config = project.getSourceFile("/workspaces/typescript-refactor/cs842website/tailwind.config.ts")
const temp = config?.getFirstChildByKind(ts.SyntaxKind.ExportAssignment)?.getFirstDescendantByKind(ts.SyntaxKind.ObjectLiteralExpression)
const theme = temp?.getChildrenOfKind(ts.SyntaxKind.PropertyAssignment).filter(j=>j.getFirstChildByKind(ts.SyntaxKind.Identifier)?.getText()==="theme")?.[0]
if (!theme)
    throw Error("no theme")//create theme if !theme

console.log(theme.getText())