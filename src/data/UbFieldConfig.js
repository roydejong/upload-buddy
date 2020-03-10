import UbImagePreviewExtension from "../extensions/UbImagePreviewExtension";

export default class UbFieldConfig {
  constructor(props) {
    props = Object.assign({ }, UbFieldConfig.defaults, props || { });

    // -----------------------------------------------------------------------------------------------------------------
    // Basic props

    /**
     * File upload target URL for HTTP POST.
     *
     * @type {string}
     */
    this.target = "/set-upload-endpoint";

    Object.keys(props).forEach((key) => {
      if (this.hasOwnProperty(key) && props.hasOwnProperty(key)) {
        this[key] = props[key];
      }
    });

    // -----------------------------------------------------------------------------------------------------------------
    // Simulated file info

    /**
     * File information to be shown, as an "already selected" file.
     *
     * @type {object|null}
     */
    this.file = null;

    if (props.file) {
      this.file = Object.assign({}, {
        name: "unknown_file",
        size: 0,
        uploaded: true
      }, props.file);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Text & built-in translations

    this.text = {
      "no_file": "Drop a file here",
      "drop_file": "Drop it like it's hot",
      "file_selected": "File selected",
      "browse": "Browse",
      "delete": "Remove",
      "already_uploading": "An upload is already in progress",
      "max_files_error": "You can only upload one file",
      "upload_failed": "Upload failed"
    };

    this.translations = {
      "nl": {
        "no_file": "Kies een bestand",
        "drop_file": "Drop je bestand hier",
        "file_selected": "Bestand geselecteerd",
        "browse": "Bladeren",
        "delete": "Verwijderen",
        "already_uploading": "Er is al een upload bezig",
        "max_files_error": "Kies maximaal 1 bestand",
        "upload_failed": "Het bestand kon niet geüpload worden"
      }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Language & text overrides

    if (props.lang && props.lang !== "en") {
      if (this.translations[props.lang]) {
        this.text = Object.assign({ }, this.text, this.translations[props.lang]);
      } else {
        console.warn('[upload-buddy]', '(UbFieldConfig)',
          'Invalid language setting (translations do not exist):', props.lang);
      }
    }

    if (props.text) {
      this.text = Object.assign({ }, this.text, props.text);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Extensions

    this.extensions = props.extensions || [];
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Defaults

UbFieldConfig.defaults = {
  lang: "en",
  extensions: [
    UbImagePreviewExtension
  ]
};