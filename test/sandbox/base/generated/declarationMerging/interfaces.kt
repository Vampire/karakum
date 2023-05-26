
@file:JsModule("sandbox-base/declarationMerging/interfaces")
@file:Suppress(
    "NON_EXTERNAL_DECLARATION_IN_INAPPROPRIATE_FILE",
)

package sandbox.base.declarationMerging




external interface Example {

@Suppress("DEPRECATION")
@nativeInvoke
operator fun  invoke(param1: String): Unit
            
var a: Double
var b: String
}
    




external interface ExampleWithOverloads {
fun method(param: String): Unit
fun method(param: Double): Unit
fun method2(param: String): Unit
fun method2(param: Double): Unit
}
    
    