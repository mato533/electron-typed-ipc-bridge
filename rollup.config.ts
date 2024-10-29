import { builtinModules } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'

import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import json from '@rollup/plugin-json'
import nodeExternals from 'rollup-plugin-node-externals'
import { dts } from 'rollup-plugin-dts'

import type { Plugin, WarningHandlerWithDefault } from 'rollup'

const onwarn: WarningHandlerWithDefault = (warning) => {
  console.error(
    'Building Rollup produced warnings that need to be resolved. ' +
      'Please keep in mind that the browser build may never have external dependencies!'
  )
  throw Object.assign(new Error(), warning)
}

const onwarnGenDts: WarningHandlerWithDefault = (warning) => {
  if (warning.code !== 'UNUSED_EXTERNAL_IMPORT') {
    console.log(warning.message)
  }
}
const emitModulePackageFile = (): Plugin => {
  return {
    name: 'emit-module-package-file',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: `{"type":"module"}`,
      })
    },
  }
}

let isDeleted = false
const getPlugins = (plugins: Plugin[]): Plugin[] => {
  if (!isDeleted) {
    isDeleted = true
    return plugins.concat([
      del({
        targets: 'dist/*',
        runOnce: true,
        verbose: true,
      }),
    ])
  } else {
    return plugins
  }
}
const sourcemap = () => process.env.CI !== 'true'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defineConfig = (pkg: Record<string, any>) => {
  const external = Object.keys(pkg.dependencies || {})
    .concat(Object.keys(pkg.peerDependencies || {}))
    .concat(builtinModules)
  return [
    {
      input: {
        index: 'src/index.ts',
        main: 'src/main.ts',
        preload: 'src/preload.ts',
        channel: 'src/channel.ts',
      },
      external,
      onwarn,
      strictDeprecations: true,
      output: [
        {
          format: 'cjs',
          dir: dirname(pkg.main),
          exports: 'named',
          footer: 'module.exports = Object.assign(exports.default, exports);',
          sourcemap: sourcemap(),
        },
        {
          format: 'es',
          dir: dirname(pkg.module),
          plugins: [emitModulePackageFile()],
          sourcemap: sourcemap(),
        },
      ],
      plugins: getPlugins([
        typescript({
          sourceMap: sourcemap(),
        }),
        json(),
        nodeExternals(),
      ]),
    },
    {
      input: {
        index: 'src/types/index.d.ts',
        main: 'src/types/main.d.ts',
        preload: 'src/types/preload.d.ts',
      },
      output: [{ dir: dirname(pkg.types) }],
      external,
      onwarn: onwarnGenDts,
      plugins: getPlugins([dts(), nodeExternals()]),
    },
  ]
}

export default defineConfig(
  JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
)
