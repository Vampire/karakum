
@file:JsModule("sandbox-top-level")

package sandbox.top.level




@Suppress("NESTED_CLASS_IN_EXTERNAL_INTERFACE")
sealed external interface MyEnum {
companion object {
val FIRST: MyEnum
val SECOND: MyEnum
}
}
    
    