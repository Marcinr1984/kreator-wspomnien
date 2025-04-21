'use client';
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import ReactCrop, { Crop, PercentCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (blob: Blob) => void;
}

export interface ImageCropperHandle {
  getCroppedImage: () => Promise<Blob | null>;
}

const ImageCropper = forwardRef<ImageCropperHandle, ImageCropperProps>(({ imageUrl }, ref) => {
  const [crop, setCrop] = useState<PercentCrop & { aspect?: number }>({
    unit: '%',
    x: 15,
    y: 15,
    width: 70,
    height: 70,
    aspect: 1,
  });
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => ({
    getCroppedImage,
  }));

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
        />
      </ReactCrop>
    </div>
  );
});

export default ImageCropper;