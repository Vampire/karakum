import path from "node:path";
import {ModuleDeclaration} from "typescript";
import {Configuration, NamespaceStrategy} from "../../configuration/configuration.js";
import {StructureItem} from "../structure.js";
import {DerivedDeclaration, DerivedDeclarationStructureItem} from "./derivedDeclaration.js";
import {createBundleInfoItem} from "../bundle/createBundleInfoItem.js";
import {createNamespaceInfoItem} from "../namespace/createNamespaceInfoItem.js";
import {createSourceFileInfoItem} from "../sourceFile/createSourceFileInfoItem.js";
import {normalizeStructure} from "../normalizeStructure.js";
import {applyPackageNameMapper} from "../package/applyPackageNameMapper.js";
import {packageToOutputFileName} from "../package/packageToFileName.js";
import {createGeneratedFile} from "../createGeneratedFile.js";

export function generateDerivedDeclarations(
    declarations: DerivedDeclaration[],
    configuration: Configuration,
    resolveNamespaceStrategy: (node: ModuleDeclaration) => NamespaceStrategy
): Record<string, string> {
    const {output, granularity} = configuration

    const structureItems: DerivedDeclarationStructureItem[] = declarations.map(generatedInfo => {
        const {sourceFileName, namespace, fileName, body} = generatedInfo

        if (granularity === "bundle") {
            const item = createBundleInfoItem(configuration)

            return {
                ...item,
                body,
            }
        }

        let item: StructureItem

        if (namespace && resolveNamespaceStrategy(namespace) === "package") {
            item = createNamespaceInfoItem(namespace, sourceFileName, configuration)
        } else {
            item = createSourceFileInfoItem(sourceFileName, configuration)
        }

        if (granularity === "top-level") {
            return {
                ...item,
                fileName,
                body,
            }
        } else {
            return {
                ...item,
                body,
            }
        }
    })

    const normalizedStructureItems = normalizeStructure(structureItems, (item, other) => ({
        ...item,
        body: `${item.body}\n\n${other.body}`
    }))

    return Object.fromEntries(
        normalizedStructureItems.map(item => {
            const packageMappingResult = applyPackageNameMapper(
                item.package,
                item.fileName,
                configuration,
            )

            const outputFileName = packageToOutputFileName(
                packageMappingResult.package,
                packageMappingResult.fileName,
                configuration,
            )

            const generated = granularity === "top-level"
                ? createGeneratedFile(
                    packageMappingResult.package,
                    packageMappingResult.fileName,
                    item.body,
                    configuration,
                )
                : item.body

            return [path.resolve(output, outputFileName), generated]
        })
    )
}
