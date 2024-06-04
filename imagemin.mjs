import imagemin from 'imagemin'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminWebp from 'imagemin-webp'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminSvgo from 'imagemin-svgo'
import { rimraf } from 'rimraf'
import path from 'path'
import fs from 'fs'

const destination = './destination'
const src = './source/'
rimraf.sync(destination)

async function optimizeImages() {
    // Recursively get all image files
    const imageFiles = getAllFiles(src, ['.jpg', '.png', '.svg'])

    // Optimize images
    for (const file of imageFiles) {
        const relativePath = path.relative(src, file)
        const outputPath = path.join(destination, relativePath)

        // Ensure directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })

        await imagemin([file], {
            destination: path.dirname(outputPath),
            plugins: [
                imageminMozjpeg({ quality: 80 }),
                imageminPngquant({ quality: [0.8, 0.8] }),
                imageminGifsicle({ optimizationLevel: 3 }),
                imageminSvgo({
                    plugins: [
                        { name: 'removeViewBox' },
                        { name: 'removeEmptyAttrs', active: false },
                    ],
                })
            ]
        })

        if (path.extname(file) === '.jpg' || path.extname(file) === '.png') {
            await imagemin([file], {
                destination: path.dirname(outputPath),
                plugins: [
                    imageminWebp({
                        quality: 80,
                        alphaQuality: 80,
                        lossless: 9,
                    })
                ]
            })
        }
    }

    console.log(imageFiles.length + ' jpg/png/svg images optimized')
}

function getAllFiles(dir, exts) {
    let results = []
    const list = fs.readdirSync(dir)
    list.forEach(file => {
        file = path.join(dir, file)
        const stat = fs.statSync(file)
        if (stat && stat.isDirectory()) {
            // Recurse into subdirectory
            results = results.concat(getAllFiles(file, exts))
        } else {
            if (exts.includes(path.extname(file))) {
                results.push(file)
            }
        }
    })
    return results
}

optimizeImages()
