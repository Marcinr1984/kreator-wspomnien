import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageEditorProps {
  // Ścieżka do obrazu, który będziemy edytować (np. URL lub base64)
  imageSrc: string;
  // Callback zwracający obszar przycięcia (crop area) – możesz go później wykorzystać do wygenerowania finalnego obrazu
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  // Proporcje – domyślnie 1, czyli kwadrat; możesz zmienić, np. 16/9 dla panoramicznych obrazów
  aspect?: number;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onCropComplete, aspect = 1 }) => {
  // Stan dla położenia obszaru przycinania
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  // Stan dla poziomu przybliżenia (zoom)
  const [zoom, setZoom] = useState(1);
  // Stan dla stopnia obrotu obrazu (rotation), początkowo 0 stopni
  const [rotation, setRotation] = useState(0);

  // Używamy useCallback, aby optymalizować wywołanie callbacku przy zakończeniu przycinania
  const onCropCompleteInternal = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      onCropComplete(croppedArea, croppedAreaPixels);
    },
    [onCropComplete]
  );

  return (
    <div className="relative w-full h-96 bg-gray-200">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        rotation={rotation}
        aspect={aspect}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onRotationChange={setRotation}
        onCropComplete={onCropCompleteInternal}
      />
    </div>
  );
};

export default ImageEditor;