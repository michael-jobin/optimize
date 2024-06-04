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

 // Define the thumbnail directory
 const thumbnailDestination = path.join(destination, 'thumbnails')

 for (const file of imageFiles) {
  const relativePath = path.relative(src, file)
  const outputPath = path.join(destination, relativePath)
  // Define the output path for the thumbnail
  const thumbnailPath = path.join(thumbnailDestination, relativePath)

  // Ensure the output directories exist
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true })

  const image = sharp(file)
  const metadata = await image.metadata()

  if (metadata.format === 'jpeg' || metadata.format === 'png') {
   // Resize and optimize the original format
   await image
    //.resize(1920) // Resize to a max width of 1920px, keeping aspect ratio
    .toFormat(metadata.format, { quality: 70 })
    .toFile(outputPath)

   // Generate a thumbnail, except for SVG files
   if (metadata.format !== 'svg') {
    await image
     .resize(10) // Resize to a max width of 300px for thumbnails
     .toFormat(metadata.format, { quality: 60 }) // More aggressive compression for thumbnails
     .toFile(thumbnailPath.replace(/\.(jpg|jpeg|png)$/, '_thumb.$1'))
   }
  } else if (metadata.format === 'svg') {
   // Simply copy SVGs
   fs.copyFileSync(file, outputPath)
  } else if (metadata.format === 'gif') {
   // Gifs are directly copied; consider similar handling as SVGs for thumbnails if necessary
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