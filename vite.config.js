import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite' 
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' 
import path from 'path'
import { fileURLToPath } from 'url'
import rawMonacoEditorPlugin from 'vite-plugin-monaco-editor'

const monacoEditorPlugin = resolvePlugin(rawMonacoEditorPlugin)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const enableMock = ['serve', 'preview'].includes(command)

  return {
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      monacoEditorPlugin({
        languageWorkers: ['json', 'editorWorkerService']
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: false,
        },
      }),
      Components({
        resolvers: [ElementPlusResolver()], 
      }),
      viteMockServe({
        mockPath: 'mock',
        enable: enableMock,
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 使用新的 Sass API，消除警告
          additionalData: `@use "@/assets/styles/dragStyle.scss" as *;`
        }
      }
    },
    // 开发模式优化
    server: {
      hmr: {
        overlay: false // 减少开发时的性能开销
      }
    },
    // 开发模式下的依赖预构建优化
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@element-plus/icons-vue',
        'lodash-es'
      ]
    },
    build: {
      rollupOptions: {
        output: {
          // 适度的代码分割，避免过度优化
          manualChunks: {
            // Vue 生态系统
            'vue-vendor': ['vue', 'vue-router', 'pinia','element-plus', '@element-plus/icons-vue'],
            // 工具库
            'lodash': ['lodash-es']
          }
        }
      }
    }
  }
})

function resolvePlugin(mod) {
  if (typeof mod === 'function') return mod
  if (mod && typeof mod.default === 'function') return mod.default
  throw new Error('Invalid plugin export')
}