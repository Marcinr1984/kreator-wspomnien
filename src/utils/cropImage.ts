import { Area } from 'react-easy-crop'
import { createImage, getRadianAngle } from './imageUtils';

export default async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('Could not get canvas context')

  const rotRad = getRadianAngle(rotation)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(rotRad)
  ctx.translate(-canvas.width / 2, -canvas.height / 2)

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Canvas is empty')
      resolve(blob)
    }, 'image/jpeg')
  })
}