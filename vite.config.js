import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import viteImagemin from 'vite-plugin-imagemin'; 
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import path from 'path';
import createSvgSpritePlugin from 'vite-plugin-svg-sprite';

const htmlFiles = Object.fromEntries(
  globSync('src/**/*.html').map(file => [
    path.relative(
      'src',
      file.slice(0, file.length - path.extname(file).length)
    ),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);


export default defineConfig({
  root: 'src/',
  publicDir: '../static/',
  base: './',

  server: {
    port: 8888,
    watch: {
      usePolling: true,
    },
  },
  build:
  {
      outDir: '../dist', // Output in the dist/ folder
      emptyOutDir: true, // Empty the folder first
      sourcemap: false, // Add sourcemap
      rollupOptions: {
        input: htmlFiles,
      }
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  plugins: [
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 20,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    createSvgSpritePlugin({
      // exportType: 'vanilla', // or 'react' or 'vue'
      include: path.resolve(__dirname, 'static/img/svg/*.svg'),
      symbolId: 'sprite-[name]',
      injectTo: 'body',
    }),
  ]
})
