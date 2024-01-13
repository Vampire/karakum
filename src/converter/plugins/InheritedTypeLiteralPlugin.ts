import ts, {IntersectionTypeNode, MappedTypeNode, TypeLiteralNode, TypeReferenceNode} from "typescript";
import {ifPresent, Render} from "../render.js";
import {CheckCoverageService, checkCoverageServiceKey} from "./CheckCoveragePlugin.js";
import {InheritanceModifierService, inheritanceModifierServiceKey} from "./InheritanceModifierPlugin.js";
import {createAnonymousDeclarationPlugin} from "./AnonymousDeclarationPlugin.js";
import {extractTypeParameters} from "../extractTypeParameters.js";
import {ConverterContext} from "../context.js";
import {InjectionService, injectionServiceKey} from "./InjectionPlugin.js";
import {convertMappedTypeBody} from "./MappedTypePlugin.js";
import {convertTypeLiteralBody} from "./TypeLiteralPlugin.js";

export function isInheritedTypeLiteral(node: ts.Node): node is IntersectionTypeNode {
    return (
        ts.isIntersectionTypeNode(node)
        && node.types.every(it => (
            ts.isTypeReferenceNode(it)
            || ts.isTypeLiteralNode(it)
            || ts.isMappedTypeNode(it)
        ))
    )
}

export function convertInheritedTypeLiteral(
    node: IntersectionTypeNode,
    name: string,
    typeParameters: string | undefined,
    context: ConverterContext,
    render: Render,
) {
    const checkCoverageService = context.lookupService<CheckCoverageService>(checkCoverageServiceKey)
    checkCoverageService?.cover(node)

    const inheritanceModifierService = context.lookupService<InheritanceModifierService>(inheritanceModifierServiceKey)
    const injectionService = context.lookupService<InjectionService>(injectionServiceKey)

    const inheritanceModifier = inheritanceModifierService?.resolveInheritanceModifier(node, context)
    const injections = injectionService?.resolveInjections(node, context, render)

    const typeReferences = node.types.filter((it): it is TypeReferenceNode => ts.isTypeReferenceNode(it))
    const typeLiterals = node.types.filter((it): it is TypeLiteralNode => ts.isTypeLiteralNode(it))
    const mappedType = node.types.find((it): it is MappedTypeNode => ts.isMappedTypeNode(it))

    const heritageTypes = typeReferences
        .map(type => render(type))
        .filter(Boolean)
        .join(", ")

    const heritageClause = ifPresent(heritageTypes, it => ` : ${it}`)

    const members = typeLiterals
        .map(it => convertTypeLiteralBody(it, context, render))
        .join("\n")

    let accessors = ""

    if (mappedType) {
        accessors = convertMappedTypeBody(mappedType, context, render)
    }

    const injectedMembers = (injections ?? [])
        .join("\n")

    return `
${ifPresent(inheritanceModifier, it => `${it} `)}external interface ${name}${ifPresent(typeParameters, it => `<${it}> `)}${heritageClause} {
${ifPresent(accessors, it => `${it}\n`)}${members}${ifPresent(injectedMembers, it => `\n${it}`)}
}
    `
}

export const inheritedTypeLiteralPlugin = createAnonymousDeclarationPlugin(
    (node, context, render) => {
        if (!isInheritedTypeLiteral(node)) return null

        const name = context.resolveName(node)

        const typeParameters = extractTypeParameters(node, context, render)

        const declaration = convertInheritedTypeLiteral(node, name, typeParameters.declaration, context, render)

        const reference = `${name}${ifPresent(typeParameters.reference, it => `<${it}>`)}`

        return {name, declaration, reference};
    }
)
