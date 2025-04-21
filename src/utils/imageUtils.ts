export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // ważne!
    image.src = url
  })
}

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

export async function getCroppedImg(
  imageSrc: string,
  crop: { x: number; y: number },
  zoom: number,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const radians = getRadianAngle(rotation);
  const safeArea = Math.max(image.width, image.height) * 2;

  canvas.width = safeArea;
  canvas.height = safeArea;

  if (!ctx) throw new Error('Brak kontekstu canvas');

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(radians);
  ctx.scale(zoom, zoom);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  const cropX = crop.x + safeArea / 2 - (canvas.width / zoom) / 2;
  const cropY = crop.y + safeArea / 2 - (canvas.height / zoom) / 2;
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = 300;
  outputCanvas.height = 300;

  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Brak kontekstu output canvas');

  outputCtx.putImageData(data, -cropX, -cropY);

  return new Promise((resolve) => {
    outputCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/jpeg');
  });
}