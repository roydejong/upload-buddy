export default class UbExtension {
  /**
   * Match the extension against file info.
   * This is used to determine whether an extension is able to add value to the field's current context and file.
   *
   * @param {UbField} field
   * @param {object} fileInfo
   *
   * @returns {boolean} If true, render the extension. If false, do not render (skip extension for this field/file).
   */
  match(field, fileInfo) {
    // ... override me
    return false;
  }

  /**
   * Render the extension as HTML.
   *
   * @param {UbField} field
   * @param {object} fileInfo
   *
   * @returns {string} HTML to append
   */
  render(field, fileInfo) {
    // ... override me
    return "";
  }

  /**
   * Called after an extension is rendered to the DOM.
   * This stage is typically used to do event binding.
   *
   * @param {UbField} field
   * @param {object} fileInfo
   */
  after(field, fileInfo) {
    // ... override me
  }
}