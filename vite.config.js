import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import fs from 'fs';

function copyExtensionFile(){
    return{
        name: 'copy-extension-files',
        writeBundle(){
            //copy manifest.json
            if(fs.existsSync('manifest.json')){
               fs.copyFileSync('manifest.json', 'dist/manifest.json');
            }
            //copy  baclground.js
            if(fs.existsSync('background.js')){
                fs.copyFileSync('background.js', 'dist/background.js');
            }
              if(fs.existsSync('content.js')){
               fs.copyFileSync('content.js', 'dist/content.js');
            }
        }
    }
}

export default defineConfig({
    plugins: [react(), copyExtensionFile()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input:{
                popup: resolve(__dirname, 'popup.html'),
            },
            output:{
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[assets]/[name].[ext]'
            }
        }
    }
})