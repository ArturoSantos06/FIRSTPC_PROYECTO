import { useEffect, useState } from 'react';

const croppedImageCache = new Map();

export const getProductImageScale = (product) => {
  if (Number(product.imageScale) > 0) return Number(product.imageScale);
  const name = `${product.name || ''} ${product.mpn || ''}`.toLowerCase();
  if (name.includes('ag400')) return 1.55;
  if (name.includes('ak400')) return 1.28;
  return 1;
};

const NormalizedProductImage = ({ src, alt, className, visualScale = 1 }) => {
  const [displaySrc, setDisplaySrc] = useState(src);

  useEffect(() => {
    let isMounted = true;
    setDisplaySrc(src);

    if (!src || croppedImageCache.has(src)) {
      if (croppedImageCache.has(src)) setDisplaySrc(croppedImageCache.get(src));
      return () => { isMounted = false; };
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const corner = [pixels[0], pixels[1], pixels[2]];
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;
        const step = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) / 180));

        for (let y = 0; y < canvas.height; y += step) {
          for (let x = 0; x < canvas.width; x += step) {
            const offset = (y * canvas.width + x) * 4;
            const alpha = pixels[offset + 3];
            const difference = Math.abs(pixels[offset] - corner[0]) + Math.abs(pixels[offset + 1] - corner[1]) + Math.abs(pixels[offset + 2] - corner[2]);
            if (alpha > 20 && difference > 42) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX <= minX || maxY <= minY) return;
        const padding = Math.max(8, Math.round(Math.min(canvas.width, canvas.height) * 0.035));
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropWidth = Math.min(canvas.width - cropX, maxX - minX + padding * 2);
        const cropHeight = Math.min(canvas.height - cropY, maxY - minY + padding * 2);
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropWidth;
        croppedCanvas.height = cropHeight;
        croppedCanvas.getContext('2d').drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
        const croppedSrc = croppedCanvas.toDataURL('image/png');
        croppedImageCache.set(src, croppedSrc);
        if (isMounted) setDisplaySrc(croppedSrc);
      } catch {
        // Si el servidor no permite leer la imagen, se conserva la imagen original.
      }
    };
    image.src = src;

    return () => { isMounted = false; };
  }, [src]);

  return <img src={displaySrc} alt={alt} className={className} style={{ transform: `scale(${visualScale})` }} />;
};

export default NormalizedProductImage;
