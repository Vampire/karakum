import {Configuration} from "../configuration/configuration.js";
import {generateImports} from "./generateImports.js";
import {StructureItem} from "./structure.js";
import {packageToOutputFileName} from "./package/packageToFileName.js";
import {createPackageName} from "./package/createPackageName.js";

export function createTargetFile(
    item: StructureItem,
    body: string,
    configuration: Configuration,
) {
    const {
        fileName,
        package: packageChunks,
        moduleName,
        qualifier,
        hasRuntime,
    } = item

    const {granularity} = configuration

    const packageName = createPackageName(packageChunks)

    const outputFileName = packageToOutputFileName(packageChunks, fileName, configuration)

    const imports = generateImports(outputFileName, configuration)

    const jsModule = hasRuntime ? `@file:JsModule("${moduleName}")` : ""
    const jsQualifier = hasRuntime && qualifier ? `@file:JsQualifier("${qualifier}")` : ""
    const typeAliasSuppress = granularity === "top-level" ? "" : `
@file:Suppress(
    "NON_EXTERNAL_DECLARATION_IN_INAPPROPRIATE_FILE",
)
    `.trim()

    const fileAnnotations = [
        jsModule,
        jsQualifier,
        typeAliasSuppress
    ]
        .filter(Boolean)
        .join("\n")

    return `
${fileAnnotations}

package ${packageName}

${imports}

${body}
    `
}
