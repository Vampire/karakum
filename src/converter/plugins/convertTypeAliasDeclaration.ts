import ts from "typescript";
import {createSimplePlugin} from "../plugin";
import {ifPresent} from "../render";

export const convertTypeAliasDeclaration = createSimplePlugin((node, context, render) => {
    if (!ts.isTypeAliasDeclaration(node)) return null
    context.cover(node)

    const name = render(node.name)

    const typeParameters = node.typeParameters
        ?.map(typeParameter => render(typeParameter))
        ?.join(", ")

    const type = render(node.type)

    return `typealias ${name}${ifPresent(typeParameters, it => `<${it}>`)} = ${type}`
})
