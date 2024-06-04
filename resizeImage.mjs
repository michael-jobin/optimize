import sharp from 'sharp'
import { rimraf } from 'rimraf'
import path from 'path'
import fs from 'fs'

const destination = './resized-destination'
const src = './source/'
const targetWidth = 708
rimraf.sync(destination)

async function resizeImages() {
  // Recursively get all image files
  const imageFiles = getAllFiles(src, ['.jpg', '.png', '.svg', '.webp', '.gif'])

  // Resize images
  for (const file of imageFiles) {
    const relativePath = path.relative(src, file)
    const outputPath = path.join(destination, relativePath)

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })

    const metadata = await sharp(file).metadata()
    const aspectRatio = metadata.width / metadata.height

    await sharp(file)
      .resize({
        width: targetWidth,
        height: Math.round(targetWidth / aspectRatio),
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(outputPath)
  }

  console.log(imageFiles.length + ' images resized')
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
      if (exts.includes(path.extname(file).toLowerCase())) {
        results.push(file)
      }
    }
  })
  return results
}

resizeImages()
