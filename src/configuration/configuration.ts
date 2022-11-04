import {CompilerOptions} from "typescript";

export type Configuration = {
    input: string | string[];
    output: string;

    ignore?: string | string[];

    libraryName?: string;

    granularity?: /* TODO: support "bundle"*/ | "file" | "top-level"

    plugins?: string | string[];

    moduleNameMapper?: Record<string, string>
    packageNameMapper?: Record<string, string>

    importInjector?: Record<string, string[]>

    compilerOptions?: CompilerOptions;

    verbose?: boolean;
}
