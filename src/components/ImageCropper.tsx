'use client';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactCrop, { Crop, PercentCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (blob: Blob) => void;
}

export interface ImageCropperHandle {
  getCroppedImage: () => Promise<Blob | null>;
}

const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(({ imageUrl }, ref) => {
  const [crop, setCrop] = useState<PixelCrop & { aspect?: number }>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    aspect: 1,
  });
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    getCroppedImage,
  }));

  const handleImageLoad = () => {
    if (!imgRef.current) return;

    const image = imgRef.current;
    const cropWidth = 200;
    const cropHeight = 200;
    const x = (image.width - cropWidth) / 2;
    const y = (image.height - cropHeight) / 2;

    setCrop({
      unit: 'px',
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: cropWidth,
      height: cropHeight,
      aspect: 1,
    });
  };

  const getCroppedImage = async () => {
    if (!imgRef.current || !crop.width || !crop.height) return null;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const inBounds =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!inBounds) return;

    e.preventDefault();
    setZoom((z) => {
      const newZoom = z + (e.deltaY < 0 ? 0.05 : -0.05);
      return Math.min(Math.max(newZoom, 0.5), 3);
    });
  };

  return (
    <div
      id="cropper-container"
      className="w-full flex flex-col items-center gap-4"
      onWheel={handleWheel}
      onMouseEnter={() => (document.body.style.overflow = 'hidden')}
      onMouseLeave={() => (document.body.style.overflow = '')}
    >
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        aspect={1}
        className="custom-crop reactCrop"
      >
        <img
          src={imageUrl}
          ref={imgRef}
          alt="Edytuj zdjęcie"
          className="max-h-[400px] object-contain"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          onLoad={handleImageLoad}
        />
      </ReactCrop>
    </div>
  );
});

export default ImageCropper;