export const SIZE = {
  MAX_WIDTH: 1024 * 8, // 8k
  MAX_HEIGHT: 1024 * 4, // 8k
};

export const TYPE = 'image/jpeg';

export const toObjectUrl = (file) => {
  var _URL = window.URL || window.webkitURL;
  return _URL.createObjectURL(file);
};

export const validImageDimension = (w, h) =>
  w % 2 === 0 && h % 2 === 0 && w / h === 2;

export const validImageType = (file) =>
  file instanceof Blob && file.type === TYPE;

export const getImageDimension = (file) =>
  new Promise((resolve) => {
    if (file instanceof Blob) {
      var objectUrl = toObjectUrl(file);
      var img = new Image();
      img.onload = function () {
        resolve({
          width: this.width,
          height: this.height,
        });
      };
      img.onerror = function () {
        resolve({});
      };
      img.src = objectUrl;
    } else {
      resolve({});
    }
  });

export const loadBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (file instanceof Blob) {
      var reader = new FileReader();
      reader.onloadend = function () {
        var image = new Image();
        image.src = reader.result;
        image.onload = function () {
          var imageWidth = image.width,
            imageHeight = image.height;
          if (imageWidth > SIZE.MAX_WIDTH || imageHeight > SIZE.MAX_HEIGHT) {
            imageWidth = SIZE.MAX_WIDTH;
            imageHeight = SIZE.MAX_HEIGHT;
          }
          var canvas = document.createElement('canvas');
          canvas.width = imageWidth;
          canvas.height = imageHeight;

          var ctx = canvas.getContext('2d');
          ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

          var imageResult = new Image();
          var imageBase64 = canvas.toDataURL(TYPE);
          imageResult.src = imageBase64;
          imageResult.onload = function () {
            resolve({
              image: this,
              imageBase64: imageBase64,
              width: imageWidth,
              height: imageHeight,
            });
          };
        };
      };
      reader.readAsDataURL(file);
    } else {
      reject('Not a Blob');
    }
  });
};

export const resizeImage = (imgSrc, outWidth, outHeight) =>
  new Promise((resolve, reject) => {
    try {
      var image = new Image();
      image.onerror = reject;
      image.onload = function () {
        var sx = 0,
          sy = 0,
          dw = outWidth,
          dh = outHeight;
        var canvas = document.createElement('canvas');
        canvas.width = outWidth;
        canvas.height = outHeight;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(this, sx, sy, image.width, image.height, 0, 0, dw, dh);

        var imageResult = new Image();
        var imageBase64 = canvas.toDataURL(TYPE);
        imageResult.src = imageBase64;
        imageResult.onerror = reject;
        imageResult.onload = function () {
          resolve(imageBase64);
        };
      };
      image.src = imgSrc;
    } catch (error) {
      reject(error);
    }
  });

export const getThumbnail = (base64, cropWidth = 256) =>
  new Promise((resolve, reject) => {
    try {
      var image = new Image();
      image.onerror = reject;
      image.onload = function () {
        var sx = 0,
          sy = 0,
          dw = cropWidth,
          dh = cropWidth,
          ratio = image.width / image.height,
          diff = Math.floor(Math.abs(image.width - image.height) / 2);
        if (image.width > image.height) {
          sx = diff;
          dw = dh * ratio;
        } else if (image.height > image.width) {
          sy = diff;
          dh = dw / ratio;
        }
        var canvas = document.createElement('canvas');
        canvas.width = cropWidth;
        canvas.height = cropWidth;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(this, sx, sy, image.width, image.height, 0, 0, dw, dh);

        var imageResult = new Image();
        var imageBase64 = canvas.toDataURL(TYPE);
        imageResult.src = imageBase64;
        imageResult.onerror = reject;
        imageResult.onload = function () {
          resolve(imageBase64);
        };
      };
      image.src = base64;
    } catch (error) {
      reject(error);
    }
  });

export const getB64DataFromDataUrl = (dataUrl) => (
  dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
);

export const base64toBlob = (dataUrl, sliceSize=512) => {
  const byteCharacters = atob(getB64DataFromDataUrl(dataUrl));
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: TYPE });
  return blob;
};
