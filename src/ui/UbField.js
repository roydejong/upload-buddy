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

    // Event bindings
    this._onBrowseClick = this._onBrowseClick.bind(this);
    this._onDragEnter = this._onDragEnter.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDrop = this._onDrop.bind(this);

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

    let hasFile = false;

    if (!hasFile) {
      element.classList.add("--no-file");

      if (this._isDropArea) {
        element.innerHTML = `
  <div class="no-file --dropping">
    <span class="message">${this._config.text.drop_file}</span>
  </div>
`;
      } else {
        element.innerHTML = `
  <div class="no-file">
    <span class="message">${this._config.text.no_file}</span>
    <a class="ub-btn --browse" href="#">${this._config.text.browse}</a>
  </div>
`;
      }
    } else {

    }

    // Insert replacement to parent
    this._element = element;

    const parent = this._field.parentElement;
    parent.appendChild(this._element);

    // Event binding
    document.querySelectorAll(".ub-btn.--browse").forEach((element) => {
      element.removeEventListener('click', this._onBrowseClick);
      element.addEventListener('click', this._onBrowseClick);
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
  // Events

  _onBrowseClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this._field.click();
    return false;
  }

  _onDragEnter(e) {
    if (!this._isDropArea) {
      this._isDropArea = true;
      this._element.classList.add("--dropping-file");
      this._element.querySelector(".no-file > .message").textContent = this._config.text.drop_file;
    }
  }

  _onDragLeave(e) {
    if (this._isDropArea) {
      this._isDropArea = false;
      this._element.classList.remove("--dropping-file");
      this._element.querySelector(".no-file > .message").textContent = this._config.text.no_file;
    }
  }

  _onDragOver(e) {
    this._onDragEnter();
  }

  _onDrop(e) {
    this._onDragLeave();
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// HTML Templates