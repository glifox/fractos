import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts'

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  {
    input: "lib/lib.ts",
    external: ['loro-crdt'],
    plugins: [dts()],
    platform: "browser",
    output: {
      dir: 'dist',
      format: 'esm',
      minify: isProduction,
      entryFileNames: ({ name, isEntry }) => {
        return name.replace("lib", "fractos") + (isEntry ? ".js": ".ts")
      }
    }
  }
]);