
@file:JsModule("sandbox/function/bindingPattern")
@file:JsNonModule

@file:Suppress(
    "NON_EXTERNAL_DECLARATION_IN_INAPPROPRIATE_FILE",
)

package sandbox.function




external interface Path {
var pathname: String
var search: String
var hash: String
}
    

external fun createPath(param: Path): String
    