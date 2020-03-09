export default class UbFieldConfig {
  constructor(props) {
    if (!props) {
      props = UbFieldConfig.defaults;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Basic props

    Object.keys(props).forEach((key) => {
      if (this.hasOwnProperty(key) && props.hasOwnProperty(key)) {
        this[key] = props[key];
      }
    });

    // -----------------------------------------------------------------------------------------------------------------
    // Simulated file info

    this.file = null;

    if (props.file) {
      this.file = Object.assign({}, {
        name: "unknown",
        size: 1000
      }, props.file);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Text & built-in translations

    this.text = {
      "no_file": "Drop a file here",
      "drop_file": "Drop it like it's hot",
      "file_selected": "File selected",
      "browse": "Browse",
      "delete": "Remove"
    };

    this.translations = {
      "nl": {
        "no_file": "Kies een bestand",
        "drop_file": "Drop je bestand hier",
        "browse": "Bladeren"
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
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Defaults

UbFieldConfig.defaults = {
  lang: "en"
};