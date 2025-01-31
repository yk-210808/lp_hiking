import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";
import viteImagemin from 'vite-plugin-imagemin'; 
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import path from 'path';
import ViteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import SVGSpriter from 'svg-sprite';

const htmlFiles = Object.fromEntries(
  globSync('src/**/*.html').map(file => [
    path.relative(
      'src',
      file.slice(0, file.length - path.extname(file).length)
    ),
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);

const exclusionFiles = (assetInfo) => {
  if (assetInfo.name === 'sprite.svg') {
    return ''; // 無視する
  }
  return 'assets/[name].[ext]';
}


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
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: (assetInfo) => {
            if(assetInfo.name === 'sprite.svg') {
              // ライブラリ側で勝手にassets内へ生成されてしまうため、上書きする
              return 'img/svg/sprite.svg'
            }else {
              return 'assets/[name].[ext]'
            }
          },
        },
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
    ViteSvgSpriteWrapper({
      icons: 'static/img/svg/*.svg',
      outputDir: 'static/img/svg/',
      sprite: SVGSpriter.Config,
    }),
  ],
})
