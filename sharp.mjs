import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { rimraf } from 'rimraf'

const destination = './destination'
const src = './source/'

// Clear the destination directory
rimraf.sync(destination)

async function optimizeImages() {
 // Recursively get all image files
 const imageFiles = getAllFiles(src, ['.jpg', '.jpeg', '.png', '.svg', '.gif'])

 for (const file of imageFiles) {
  const relativePath = path.relative(src, file)
  const outputPath = path.join(destination, relativePath)

  // Ensure the output directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  const image = sharp(file)
  const metadata = await image.metadata()

  if (metadata.format === 'jpeg' || metadata.format === 'png') {
   // Optimize and save the original format
   await image
    .toFormat(metadata.format, { quality: 80 })
    .toFile(outputPath)

   // Convert and save as WebP
   await image
    .webp({ quality: 80 })
    .toFile(outputPath.replace(/\.(jpg|jpeg|png)$/, '.webp'))

   // Convert and save as AVIF
   await image
    .avif({ quality: 80 })
    .toFile(outputPath.replace(/\.(jpg|jpeg|png)$/, '.avif'))
  } else if (metadata.format === 'svg') {
   // Simply copy SVGs
   fs.copyFileSync(file, outputPath)
  } else if (metadata.format === 'gif') {
   // Gifs are not directly supported for conversion in Sharp;
   fs.copyFileSync(file, outputPath)
  } else {
   // For any other formats, add additional cases here
   console.log(`Unsupported format: ${metadata.format} for file ${file}`)
  }
 }

 console.log(`${imageFiles.length} images processed.`)
}

function getAllFiles(dir, exts) {
 let results = []
 const list = fs.readdirSync(dir)
 list.forEach(file => {
  file = path.join(dir, file)
  const stat = fs.statSync(file)
  if (stat && stat.isDirectory()) {
   // Recurse into a subdirectory
   results = results.concat(getAllFiles(file, exts))
  } else {
   // If the file matches one of the extensions, add it to the results
   if (exts.includes(path.extname(file))) {
    results.push(file)
   }
  }
 })
 return results
}

optimizeImages().then(() => console.log('Image optimization complete.'))
