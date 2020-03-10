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
     * @private
     */
    this._config = ubfConfig;

    // State info
    this._isDropArea = false;
    this._isDeleting = false;
    this._fileInfo = null;
    this._isUploading = false;
    this._uploadProgress = 0.0;

    // Event bindings
    this._onBrowseClick = this._onBrowseClick.bind(this);
    this._onDeleteClick = this._onDeleteClick.bind(this);

    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDrop = this._onDrop.bind(this);

    this._onFieldChange = this._onFieldChange.bind(this);

    // Go!
    this._setUp();
  }

  /**
   * Initializes or updates the UbField in the DOM.
   *
   * @private
   */
  _setUp() {
    // Hide original element
    this._field.classList.add("--ub-hidden");
    this._field.type = "file";
    this._field.style.display = "none";
    this._field.style.visibility = "hidden";
    this._field.style.position = "absolute";

    // Create replacement element
    const element = this._element || document.createElement('div');

    element.className = "";
    element.classList.add("UbField");

    let hasFile = !!this._field.value;

    if (this._config.file && !this._isDeleting) {
      // Already-selected file info for the UI
      this._fileInfo = this._config.file;
      hasFile = true;
    }

    if (!hasFile) {
      element.classList.add("--no-file");

      if (this._isDropArea)
        element.classList.add("--dropping-file");

      element.innerHTML = `
  <div class="no-file">
    <span class="message">${this._isDropArea ? this._config.text.drop_file : this._config.text.no_file}</span>
    <a class="ub-btn --browse" href="#">${this._config.text.browse}</a>
  </div>
`;
    } else {
      let nameActual;

      if (this._fileInfo.url && this._fileInfo.url.indexOf('data:') !== 0) {
        nameActual = `<a href="${this._fileInfo.url || "#"}" target="_blank" class="name-actual">${this._fileInfo.name || "File"}</a>`;
      } else {
        nameActual = `<span class="name-actual">${this._fileInfo.name || "File"}</span>`;
      }

      element.classList.add("--has-file");
      element.innerHTML = `
  <div class="file-selected">
    <div class="details">
        <h6 class="status">${this._config.text.file_selected}</h6>
        <div class="name">
            ${nameActual}
            <span class="size">(${Math.ceil(this._fileInfo.size / 1024)}kb)</span>
        </div>
    </div>
    <div class="controls">
        <a class="ub-btn --delete" href="#">${this._config.text.delete}</a>
    </div>
  </div>
  ${this._renderExtensions()}
`;
    }

    // Insert replacement to parent
    this._element = element;

    const parent = this._field.parentElement;
    parent.appendChild(this._element);

    // Event binding
    this._field.removeEventListener('change', this._onFieldChange);
    this._field.addEventListener('change', this._onFieldChange);

    document.querySelectorAll(".ub-btn.--browse").forEach((element) => {
      element.removeEventListener('click', this._onBrowseClick);
      element.addEventListener('click', this._onBrowseClick);
    });

    document.querySelectorAll(".ub-btn.--delete").forEach((element) => {
      element.removeEventListener('click', this._onDeleteClick);
      element.addEventListener('click', this._onDeleteClick);
    });

    document.querySelectorAll(".UbField").forEach((element) => {
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
  }

  // -------------------------------------------------------------------------------------------------------------------
  // File extensions

  _renderExtensions() {
    let output = "";

    if (this._fileInfo) {
      this._config.extensions.forEach((extension) => {
        if (extension.match(this._fileInfo) === true) {
          output += extension.render(this._fileInfo);
        }
      });
    }

    return output;
  }

// -------------------------------------------------------------------------------------------------------------------
// Events

  _onBrowseClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // "Click" the field to force browse dialog to open
    this._field.click();

    return false;
  }

  _onDeleteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    // Clear selection
    this._field.value = "";
    this._isDeleting = true;
    this._isDropArea = false;

    // Refresh UI
    this._setUp();

    return false;
  }

  _onDragEnter(e) {
    if (e) {
      e.preventDefault();
    }

    if (!this._isDropArea) {
      this._isDropArea = true;
      this._element.classList.add("--dropping-file");
      this._element.querySelector(".no-file > .message").textContent = this._config.text.drop_file;
    }
  }

  _onDragLeave() {
    if (this._isDropArea) {
      this._isDropArea = false;
      this._element.classList.remove("--dropping-file");
      this._element.querySelector(".no-file > .message").textContent = this._config.text.no_file;
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
    this._setUp();
  }

  _onFieldChange(e) {
    // Handle files & refresh UI
    this._handleFiles(this._field.files);
    this._setUp();
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
      // TODO Nice UI Error
      alert('1 file limit');
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
          this._setUp();
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('[upload-buddy]', '(UbField)', 'Preview URL could not be generated:', err);
    }

    // Perform the upload
    this._uploadFile(file);
  }

  _uploadFile(file) {
    if (this._isUploading) {
      // TODO handle better
      alert('upload already in progress');
      return;
    }

    this._isUploading = true;
    this._uploadProgress = 0;

    const url = this._config.target;

    let payload = new FormData();
    payload.append('file', file);

    console.log('[upload-buddy]', '(UbField)', 'File upload:', url, payload);

    fetch(url, {
      method: 'POST',
      body: payload
    })
    .then((res) => {
      if (res.status === 200) {
        // Upload success
        this._isUploading = false;
        this._uploadProgress = 100;

        if (this._fileInfo.name === file.name) {
          this._fileInfo.uploaded = true;
        }

        // TODO Handle optional file URL from response
      } else {
        // Upload failure
        this._isUploading = false;
        this._uploadProgress = 100;

        alert('upload failure');

        // TODO Handle optional error from response + error UI
      }
    })
    .catch((err) => {
      this._isUploading = false;
      this._uploadProgress = 0;

      // TODO Nice UI Error
      alert('upload errored: ' + err);
    });
  }
}