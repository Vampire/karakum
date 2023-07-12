import ts from "typescript";
import {NameResolver} from "../nameResolver.js";
import {capitalize} from "../../utils/strings.js";

export const resolveCallSignatureParameterName: NameResolver = (node) => {
    if (!node.parent) return null
    if (!ts.isParameter(node.parent)) return null
    if (!ts.isIdentifier(node.parent.name)) return null

    const parameterName = node.parent.name.text

    if (!node.parent.parent) return null
    if (!ts.isCallSignatureDeclaration(node.parent.parent)) return null
    if (!node.parent.parent.parent) return null
    if (!ts.isInterfaceDeclaration(node.parent.parent.parent)) return null

    const parentName = node.parent.parent.parent.name.text

    return `${capitalize(parentName)}${capitalize(parameterName)}`
}
