import {snakeToCamelCase} from "../utils/strings";
import {applyMapper, generateOutputFileName} from "../utils/fileName";
import {KOTLIN_KEYWORDS} from "../converter/constants";
import path from "path";

function libraryNameToDir(libraryName: string) {
    return libraryName
        .replace(/[-\/]/g, "/")
        .replace(/@/g, "")
}

function dirNameToPackage(dirName: string) {
    const preparedDirName = dirName === "." // handle root dir
        ? ""
        : dirName

    return preparedDirName.split("/")
        .filter(it => it !== "")
        .map(it => {
            if (KOTLIN_KEYWORDS.has(it)) {
                return `\`${it}\``
            } else {
                return it
            }
        })
        .join(".")
}

export function generateOutputFileInfo(
    prefix: string,
    sourceFileName: string,
    libraryName: string,
    libraryNameOutputPrefix: boolean,
    packageNameMapper: Record<string, string> | undefined,
) {
    const outputFileName = generateOutputFileName(prefix, sourceFileName)
    const preparedOutputFileName = snakeToCamelCase(applyMapper(outputFileName, packageNameMapper))

    const preparedLibraryName = libraryNameToDir(libraryName)
    const prefixedOutputFileName = `${preparedLibraryName}/${preparedOutputFileName}`

    const outputDirName = path.dirname(prefixedOutputFileName)
    const packageName = dirNameToPackage(outputDirName)

    return {
        outputFileName: libraryNameOutputPrefix
            ? prefixedOutputFileName
            : preparedOutputFileName,
        packageName,
    }
}
