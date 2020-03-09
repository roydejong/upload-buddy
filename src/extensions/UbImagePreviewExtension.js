import UbExtension from "./UbExtension";

const UbImagePreviewExtension = new UbExtension();

UbImagePreviewExtension.match = (fileInfo) => {
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

UbImagePreviewExtension.render = (fileInfo) => {
  return `
  <img class="ext-image-preview" src="${fileInfo.url}" alt="Preview"/>
`;
};

export default UbImagePreviewExtension;