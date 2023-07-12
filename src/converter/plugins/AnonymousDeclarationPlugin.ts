import path from "path";
import ts, {Node} from "typescript";
import {ConverterPlugin} from "../plugin.js";
import {ConverterContext} from "../context.js";
import {Render} from "../render.js";
import {createGeneratedFile} from "../../structure/createGeneratedFile.js";
import {ConfigurationService, configurationServiceKey} from "./ConfigurationPlugin.js";
import {NameResolver} from "../nameResolver.js";
import {createSourceFileInfoItem} from "../../structure/sourceFile/createSourceFileInfoItem.js";
import {applyPackageNameMapper} from "../../structure/package/applyPackageNameMapper.js";
import {packageToOutputFileName} from "../../structure/package/packageToFileName.js";

export interface AnonymousDeclarationContext extends ConverterContext {
    resolveName(node: Node): string
}

export interface AnonymousDeclarationRenderResult {
    name: string
    declaration: string
    reference: string
}

export type AnonymousDeclarationRender = (
    node: ts.Node,
    context: AnonymousDeclarationContext,
    render: Render,
) => AnonymousDeclarationRenderResult | string | null

class AnonymousDeclarationPlugin<TNode extends Node = Node> implements ConverterPlugin {
    private counter = 0
    private readonly generated: Record<string, { name: string, declaration: string }[]> = {}

    constructor(
        private nameResolvers: NameResolver<TNode>[],
        private anonymousDeclarationRender: AnonymousDeclarationRender,
    ) {
    }

    generate(context: ConverterContext): Record<string, string> {
        const configurationService = context.lookupService<ConfigurationService>(configurationServiceKey)
        const configuration = configurationService?.configuration
        if (configuration === undefined) throw new Error("TypeLiteralPlugin can't work without ConfigurationService")

        const {output, granularity} = configuration

        return Object.fromEntries(
            Object.entries(this.generated)
                .flatMap(([sourceFileName, declarations]) => {
                    const sourceFileInfoItem = createSourceFileInfoItem(
                        sourceFileName,
                        configuration,
                    )

                    if (granularity === "top-level") {
                        return declarations
                            .map(({name, declaration}) => {
                                const fileName = `${name}.kt`

                                const packageMappingResult = applyPackageNameMapper(
                                    sourceFileInfoItem.package,
                                    fileName,
                                    configuration,
                                )

                                const outputFileName = packageToOutputFileName(
                                    packageMappingResult.package,
                                    fileName,
                                    configuration,
                                )

                                const generatedFile = createGeneratedFile(
                                    packageMappingResult.package,
                                    packageMappingResult.fileName,
                                    declaration,
                                    configuration,
                                )

                                return [path.resolve(output, outputFileName), generatedFile];
                            })
                    } else {
                        const generatedFile = declarations
                            .map(({declaration}) => declaration)
                            .join("\n\n")

                        const packageMappingResult = applyPackageNameMapper(
                            sourceFileInfoItem.package,
                            sourceFileInfoItem.fileName,
                            configuration,
                        )

                        const outputFileName = packageToOutputFileName(
                            packageMappingResult.package,
                            packageMappingResult.fileName,
                            configuration,
                        )

                        return [[path.resolve(output, outputFileName), generatedFile]];
                    }
                })
        );
    }

    render(node: ts.Node, context: ConverterContext, next: Render): string | null {
        const resolveName = (node: TNode) => this.resolveName(node, context)

        const anonymousDeclarationContext = {
            ...context,
            resolveName,
        }

        const result = this.anonymousDeclarationRender(
            node,
            anonymousDeclarationContext,
            next
        )

        if (result === null || typeof result === "string") return result

        const fileName = node.getSourceFile()?.fileName ?? "generated.d.ts"
        const {name, declaration, reference} = result

        const generatedDeclarations = this.generated[fileName] ?? []

        generatedDeclarations.push({
            name,
            declaration,
        })

        this.generated[fileName] = generatedDeclarations

        return reference;
    }

    setup(context: ConverterContext): void {
    }

    traverse(node: ts.Node, context: ConverterContext): void {
    }

    private resolveName(node: TNode, context: ConverterContext): string {
        for (const nameResolver of this.nameResolvers) {
            const result = nameResolver(node, context)

            if (result !== null) return result
        }

        return `Temp${this.counter++}`
    }
}

export function createAnonymousDeclarationPlugin<TNode extends Node = Node>(
    defaultNameResolvers: NameResolver<TNode>[],
    render: AnonymousDeclarationRender,
) {
    return (nameResolvers: NameResolver[]): ConverterPlugin => {
        return new AnonymousDeclarationPlugin(
            [
                ...nameResolvers,
                ...defaultNameResolvers,
            ],
            render,
        )
    }
}
