import UbFieldConfig from "../data/UbFieldConfig";

export default class UbField {
  // -------------------------------------------------------------------------------------------------------------------
  // Static setup helper

  /**
   * @param {string} selector
   * @param {object|UbFieldConfig|null} options
   */
  static setup(selector, options = null) {
    // Target selection
    let selection = document.querySelectorAll(selector);

    if (!selection || selection.length === 0) {
      console.error('[upload-buddy]', '(UbField)',
        'Setup failed, provided selector did not match any elements:', selector);
      return false;
    }

    // Config parsing
    let config;

    try {
      config = new UbFieldConfig(options);
    } catch (err) {
      console.error('[upload-buddy]', '(UbField)',
        'Could not process configuration input.', err);
      return false;
    }

    // Set up fields
    selection.forEach((element) => {
      if (element.classList.contains('--ub-hidden') || element.getAttribute('ub-bound') !== null) {
        // Skip element, already bound
        return;
      }

      try {
        new UbField(element, config);
      } catch (err) {
        console.error('[upload-buddy]', '(UbField)',
          'Error in field set up for element:', element, err);
        return false;
      }
    });

    return true;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Init

  /**
   * @param {Element} element
   * @param {UbFieldConfig} ubfConfig
   */
  constructor(element, ubfConfig) {
    /**
     * The original, backing <input/> element we are replacing.
     *
     * @type {Element}
     * @private
     */
    this._field = element;

    /**
     * The form element hosting us.
     *
     * @type {Element}
     * @private
     */
    this._form = element.form;

    /**
     * The replacement element (UbField div).
     *
     * @type {Element|null}
     * @private
     */
    this._element = null;

    /**
     * Configuration data for this field.
     *
     * @type {UbFieldConfig}
     */
    this.config = ubfConfig;

    // Create backing field
    this._backField = document.createElement('input');
    this._backField.name = this._field.name;
    this._backField.value = "";
    this._backField.style.display = "none";
    this._backField.style.visibility = "hidden";
    this._form.appendChild(this._backField);

    this._field.name = `${this._backField.name}_old`;

    // State info
    this._error = "";
    this._isDropArea = false;
    this._isDeleting = false;
    this._fileInfo = null;
    this._isUploading = false;
    this._uploadProgress = 0.0;

    /**
     * @type {UbExtension[]}
     * @private
     */
    this._renderedExtensions = [];

    // Event references
    this._onBrowseClick = this._onBrowseClick.bind(this);
    this._onDeleteClick = this._onDeleteClick.bind(this);

    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDrop = this._onDrop.bind(this);

    this._onFieldChange = this._onFieldChange.bind(this);

    this._onFormSubmit = this._onFormSubmit.bind(this);

    // Form binding
    this._form.addEventListener("submit", this._onFormSubmit);

    // Go!
    this.update();
  }

  /**
   * Gets the field name.
   *
   * @returns {string}
   */
  get name() {
    return this._backField.name;
  }

  /**
   * Gets a selector for the UbField UI element.
   *
   * @returns {Element}
   */
  get domElement() {
    return this._element;
  }

  /**
   * Initializes or updates the UbField in the DOM.
   * This will cause a full re-render of the field and any extensions.
   */
  update() {
    // Hide original element
    this._field.classList.add("--ub-hidden");
    this._field.type = "file";
    this._field.style.display = "none";
    this._field.style.visibility = "hidden";
    this._field.style.position = "absolute";
    this._field.setAttribute('ub-bound', "1");

    // Create replacement element
    const element = this._element || document.createElement('div');

    element.className = "";
    element.classList.add("UbField");
    element.innerHTML = "";

    // Prefix error message if one is present
    if (this._error) {
      element.innerHTML += `
  <div class="error-bar">
    <span>${this._error}</span>
  </div>
`;
    }

    // Determine whether we are presenting a file, or presenting an upload field
    let hasFile = (!!this._field.value || (this._fileInfo && this._fileInfo.uploaded) || this._isUploading);

    if (this.config.file && !this._isDeleting) {
      // Already-selected file info for the UI
      this._fileInfo = this.config.file;

      this._backField.value = JSON.stringify(this._fileInfo);
      this._field.value = "";

      hasFile = true;
    }

    if (!hasFile) {
      element.classList.add("--no-file");

      if (this._isDropArea)
        element.classList.add("--dropping-file");

      element.innerHTML += `
  <div class="no-file">
    <span class="message">${this._isDropArea ? this.config.text.drop_file : this.config.text.no_file}</span>
    <a class="ub-btn --browse" href="#">${this.config.text.browse}</a>
  </div>
`;
    } else {
      element.classList.add("--has-file");

      // ---

      let statusText = this.config.text.file_selected;

      if (this._isUploading) {
        element.classList.add("--uploading");
        statusText = this.config.text.file_uploading;
      }

      // ---

      let nameActual = "";
      let sizeIndicator = "";

      if (this._fileInfo && this._fileInfo.url && this._fileInfo.url.indexOf('data:') !== 0) {
        nameActual = `<a href="${this._fileInfo.url || "#"}" target="_blank" class="name-actual">${this._fileInfo.name || "File"}</a>`;
      } else {
        nameActual = `<span class="name-actual">${this._fileInfo.name || "File"}</span>`;
      }

      if (this._fileInfo.size) {
        sizeIndicator = `<span class="size">(${Math.ceil(this._fileInfo.size / 1024)}kb)</span>`;
      }

      // ---

      let controls = "";

      if (this._fileInfo.uploaded) {
        controls = `<a class="ub-btn --delete" href="#">${this.config.text.delete}</a>`;
      } else if (this._isUploading) {
        controls = `<div class="ub-prog"><div class="prog-inner" style="width: ${this._uploadProgress.toFixed(2)}%;"></div></div>`;
      }

      // ---

      element.innerHTML += `
  <div class="file-selected">
    <div class="details">
        <h6 class="status">${statusText}</h6>
        <div class="name">
            ${nameActual}
            ${sizeIndicator}
        </div>
    </div>
    <div class="controls">
        ${controls}
    </div>
  </div>
  ${this._renderExtensions()}
`;
    }

    // Insert replacement to parent
    this._element = element;

    const parent = this._field.parentElement;
    parent.insertBefore(this._element, this._field);

    // Event binding
    this._field.removeEventListener('change', this._onFieldChange);
    this._field.addEventListener('change', this._onFieldChange);

    this._element.querySelectorAll(".ub-btn.--browse").forEach((element) => {
      element.removeEventListener('click', this._onBrowseClick);
      element.addEventListener('click', this._onBrowseClick);
    });

    this._element.querySelectorAll(".ub-btn.--delete").forEach((element) => {
      element.removeEventListener('click', this._onDeleteClick);
      element.addEventListener('click', this._onDeleteClick);
    });

    this._element.querySelectorAll(".UbField").forEach((element) => {
      element.removeEventListener('dragenter', this._onDragEnter);
      element.removeEventListener('dragleave', this._onDragLeave);
      element.removeEventListener('dragover', this._onDragOver);
      element.removeEventListener('drop', this._onDrop);
      element.removeEventListener('click', this._onBrowseClick);

      if (element.classList.contains('--no-file')) {
        element.addEventListener('dragenter', this._onDragEnter);
        element.addEventListener('dragleave', this._onDragLeave);
        element.addEventListener('dragover', this._onDragOver);
        element.addEventListener('drop', this._onDrop);
        element.addEventListener('click', this._onBrowseClick);
      }
    });

    // Extension event bindings
    setTimeout(() => {
      this._renderedExtensions.forEach((ext) => {
        ext.after(this, this._fileInfo);
      });
    }, 0);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // File extensions

  _renderExtensions() {
    let output = "";
    let renderedExtensions = [];

    if (this._fileInfo) {
      this.config.extensions.forEach((extension) => {
        if (extension.match(this, this._fileInfo) === true) {
          output += extension.render(this, this._fileInfo);
          renderedExtensions.push(extension);
        }
      });
    }

    this._renderedExtensions = renderedExtensions;
    return output;
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Events

  _onBrowseClick(e) {
    e.preventDefault();
    e.stopPropagation();

    this._error = null;

    // "Click" the field to force browse dialog to open
    this._field.click();

    return false;
  }

  _onDeleteClick(e = null) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this._error = null;

    // Clear selection
    this._field.value = "";
    this._isDeleting = true;
    this._isDropArea = false;
    this._fileInfo = null;

    // Update backing field
    this._backField.value = "";

    // Refresh UI
    this.update();

    return false;
  }

  _onDragEnter(e) {
    if (e) {
      e.preventDefault();
    }

    if (!this._isDropArea) {
      this._isDropArea = true;
      this._element.classList.add("--dropping-file");
      this._element.querySelector(".no-file > .message").textContent = this.config.text.drop_file;
    }
  }

  _onDragLeave() {
    if (this._isDropArea) {
      this._isDropArea = false;
      this._element.classList.remove("--dropping-file");
      this._element.querySelector(".no-file > .message").textContent = this.config.text.no_file;
    }
  }

  _onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    this._onDragEnter();
  }

  _onDrop(e) {
    e.preventDefault();

    // Trigger "drag leave" logic to clean up UI
    this._onDragLeave();

    // Handle files & refresh UI
    const dt = e.dataTransfer;
    const files = dt.files;

    this._handleFiles(files);
    this.update();
  }

  _onFieldChange(e) {
    // Handle files & refresh UI
    this._handleFiles(this._field.files);
    this.update();
  }

  _onFormSubmit(e) {
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Upload logic

  _handleFiles(files) {
    files = [...files];

    if (files.length === 0) {
      // No input, ignore
      return;
    }

    if (this._isUploading) {
      // Already uploading, ignore
      return;
    }

    if (files.length > 1) {
      this._error = this.config.text.max_files_error;
      return;
    }

    // Modify local state, add file info
    const file = files[0];
    console.log('[upload-buddy]', '(UbField)', 'File selection:', file);

    this._fileInfo = file;
    this._fileInfo.uploaded = false;
    this._fileInfo.url = null;

    // Read as base64 URL for preview purposes
    try {
      let reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (result && this._fileInfo.name === file.name && !this._fileInfo.url) {
          this._fileInfo.url = result;
          this.update();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('[upload-buddy]', '(UbField)', 'Preview URL could not be generated:', err);
    }

    // Perform the upload
    this._uploadFile(file);
  }

  _tryTriggerCallback(callback, ...args) {
    if (this.config[callback]) {
      try {
        this.config[callback](...args);
      } catch (e) {
        console.error('[upload-buddy]', '(UbField)', 'Error in config callback:', e);
      }
    }
  }

  _uploadFile(file) {
    this._error = null;

    if (this._isUploading) {
      this._error = this.config.text.already_uploading;
      this.update();
      return;
    }

    this._isUploading = true;
    this._uploadProgress = 0;
    this._backField.value = "";

    this.update();

    const url = this.config.target;

    let payload = new FormData();
    payload.append('file', file);

    this._tryTriggerCallback('onUploadStart', file);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.upload.addEventListener("progress", (e) => {
      if (e.total) {
        this._uploadProgress = ((e.loaded * 100.0 / e.total) || 100);
        this._element.querySelector(".ub-prog .prog-inner").style.width = `${this._uploadProgress.toFixed(2)}%`;
        this._tryTriggerCallback('onUploadProgress', this._uploadProgress);
      }
    });
    xhr.addEventListener('readystatechange', (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Done. Update the UI
          console.log('[upload-buddy]', '(UbField)', 'File upload success:', xhr.responseText);

          this._isUploading = false;
          this._uploadProgress = 100;
          this._error = "";

          let finalResponseObject = null;
          if (xhr.responseText) {
            try {
              // If a JSON object is returned in the response body, we will take it on board as file metadata
              // This can be useful for passing back stuff like upload IDs through the form submission
              let asObject = JSON.parse(xhr.responseText);

              if (asObject && typeof asObject === "object") {
                this._fileInfo = Object.assign({}, {
                  name: this._fileInfo.name,
                  size: this._fileInfo.size,
                  url: this._fileInfo.url,
                  type: this._fileInfo.type
                }, asObject);
                finalResponseObject = asObject;
              }
            } catch (e) {
            }
          }


          this._field.value = "";
          this._fileInfo.uploaded = true;
          this._backField.value = JSON.stringify(this._fileInfo);

          this._tryTriggerCallback('onUploadSuccess', finalResponseObject);
          this.update();
        } else {
          // Non-200 state
          console.error('[upload-buddy]', '(UbField)', 'File upload error:', xhr.responseText);

          this._isUploading = false;
          this._uploadProgress = 100;

          this._field.value = "";
          this._fileInfo = null;
          this._backField.value = "";

          if (xhr.responseText && xhr.responseText.indexOf('<') === -1) {
            // Looks like a plain text error message, not HTML
            this._error = xhr.responseText;
          } else {
            // Doesn't look like an error message we can display, use generic error
            this._error = this.config.text.upload_failed;
          }

          this._tryTriggerCallback('onUploadError', xhr.responseText);
          this.update();
        }
      }
    });
    xhr.send(payload);
  }

  // -------------------------------------------------------------------------------------------------------------------
  // Upload utilities

  /**
   * Converts a data: URL to a file (e.g. for base 64 encoded images after cropping).
   *
   * @source https://uploadcare.com/community/t/how-to-upload-base64-encoded-image-from-javascript/53
   *
   * @param {string} dataUrl - The raw data: image URL.
   * @param {string} filename - The "original" file name to assign to it.
   * @returns {File}
   */
  static convertDataUrlToFile(dataUrl, filename) {
    let arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type: mime});
  }

  /**
   * Takes a data: blob URL, converts it to a file, and attempts to upload it.
   * This action will replace any existing file input.
   *
   * @param dataUrl
   * @param filename
   */
  uploadDataUrlAsFile(dataUrl, filename) {
    const file = UbField.convertDataUrlToFile(dataUrl, filename);

    if (file) {
      // Clear the input, as if delete is pressed
      this._onDeleteClick(null);

      // Modify local state, add file info
      console.log('[upload-buddy]', '(UbField)', 'Virtual file selection (from data URL):', file);

      this._fileInfo = file;
      this._fileInfo.uploaded = false;
      this._fileInfo.url = dataUrl;

      // Perform the upload
      this._uploadFile(file);
    }
  }
}