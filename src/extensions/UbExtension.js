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
    return "";
  }
}