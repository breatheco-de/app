/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */

// This function is used to convert base64 encoding to mime type (blob)
function base64ToBlob(base64, mime) {
  mime = mime || '';
  const sliceSize = 1024;
  const byteChars = window.atob(base64);
  const byteArrays = [];

  for (let offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
    const slice = byteChars.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mime });
}

export const createImage = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', () => resolve(image));
  image.addEventListener('error', (error) => reject(error));
  image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
  image.src = url;
});

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calcular el tamaño del cuadro delimitador de la imagen rotada
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // configurar el tamaño del canvas para que coincida con el cuadro delimitador
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Rellenar el fondo del canvas con color rojo antes de dibujar la imagen
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, bBoxWidth, bBoxHeight);

  // traducir el contexto del canvas a una ubicación central para permitir la rotación y volteo alrededor del centro
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // dibujar la imagen rotada
  ctx.drawImage(image, 0, 0);

  // Ahora, establecer el tamaño final del canvas para el área recortada
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Rellenar el fondo del canvas recortado con rojo
  croppedCtx.fillStyle = 'white';
  croppedCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);

  // Extraer la imagen recortada de la imagen rotada
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height, // origen de la imagen
    0,
    0,
    pixelCrop.width,
    pixelCrop.height, // destino del recorte
  );

  // Convertir el canvas a una URL de imagen en formato Base64
  const imgURI = croppedCanvas.toDataURL('image/png');
  const imgFile64 = imgURI.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
  const pngBlob = base64ToBlob(imgFile64, 'image/png');

  return {
    imgURI,
    blob: pngBlob,
  };
}
