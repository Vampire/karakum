package io.github.sgrishchenko.karakum.gradle.plugin.tasks

import io.github.sgrishchenko.karakum.gradle.plugin.KARAKUM_CONFIG_FILE
import org.gradle.api.Task
import org.gradle.kotlin.dsl.getByType
import org.jetbrains.kotlin.gradle.dsl.KotlinMultiplatformExtension
import org.jetbrains.kotlin.gradle.plugin.KotlinCompilation
import org.jetbrains.kotlin.gradle.plugin.mpp.KotlinJsCompilation
import org.jetbrains.kotlin.gradle.targets.js.npm.npmProject
import java.io.File

val Task.kotlinJsCompilation: KotlinJsCompilation
    get() {
        val extension = project.extensions.getByType<KotlinMultiplatformExtension>()
        val target = extension.js()

        return target.compilations.getByName(KotlinCompilation.MAIN_COMPILATION_NAME)
    }

val Task.defaultOutputConfig: File
    get() = project.layout.buildDirectory.asFile.get().resolve("karakum/$KARAKUM_CONFIG_FILE")

val Task.defaultOutputExtensions: File
    get() = kotlinJsCompilation.npmProject.dir.resolve("karakum")
