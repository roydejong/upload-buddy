import UbExtension from "./UbExtension";

// ---------------------------------------------------------------------------------------------------------------------

const UbImageExtension = new UbExtension();
UbImageExtension._images = {};

// ---------------------------------------------------------------------------------------------------------------------

UbImageExtension.match = (field, fileInfo) => {
  if (!fileInfo.url) {
    // Not marked as "uploaded" yet, or URL is missing
    return false;
  }

  if (fileInfo.type && fileInfo.type.indexOf("image/") === 0) {
    // Has an image mime-type
    return true;
  }

  if (fileInfo.name) {
    const fileName = fileInfo.name.toLowerCase();

    let fileExtensions = ["png", "apng", "jpg", "jpeg", "gif", "svg", "ico"];
    let extMatched = false;

    fileExtensions.forEach((extension) => {
      console.log(fileName.indexOf(`.${extension}`), ((fileName.length - extension.length) - 1),
        fileName.indexOf(`.${extension}`) === ((fileName.length - extension.length) - 1));
      if (fileName.indexOf(`.${extension}`) === ((fileName.length - extension.length) - 1)) {
        // Looks like an image by its extension
        extMatched = true;
        return;
      }
    });

    if (extMatched) {
      return true;
    }
  }

  // Does not look like an image
  return false;
};

// ---------------------------------------------------------------------------------------------------------------------

UbImageExtension.render = (field, fileInfo) => {
  // 1. We can only render if we have a file URL; either a real URL or base64/data URL
  const url = fileInfo.url;

  if (!url) {
    return "";
  }

  // 2. If we haven't already, (pre)load the image to request its metadata
  if (!UbImageExtension._images[url]) {
    let newImg = document.createElement('img');
    newImg.onload = function () {
      UbImageExtension._images[url] = newImg;
      field.update();
    };
    newImg.src = url;
    return "";
  }

  // 3. Once we have the image preloaded for the given URL, we can finally render the extension
  const img = UbImageExtension._images[url];

  let extra = "";

  // If crop is supported
  const hasCropSupport = !!(typeof window.Cropper !== "undefined" && window.Cropper);

  if (hasCropSupport) {
    extra += `<a class="ub-btn --go-cropper">${field.config.text.crop}</a>`;
  }

  // Render output
  return `
<div class="UbImageExtension">
    <div class="ext-image-preview">
        ${img.outerHTML}     
    </div>
    <div class="ext-image-stats">
      <span class="resolution">${img.width} × ${img.height} px</span>
      ${extra}
    </div>
</div>
`;
};

// ---------------------------------------------------------------------------------------------------------------------

UbImageExtension.after = (field, fileInfo) => {
  let cropButton = field.domElement.querySelector('.UbImageExtension .ub-btn.--go-cropper');

  if (cropButton) {
    cropButton.addEventListener('click', (e) => {
      e.preventDefault();
      alert('!');
      return false;
    });
  }
};

// ---------------------------------------------------------------------------------------------------------------------

UbImageExtension.crop = (field, file, img) => {
  alert(img.href);
};

// ---------------------------------------------------------------------------------------------------------------------

export default UbImageExtension;