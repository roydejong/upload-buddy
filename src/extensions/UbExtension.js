export default class UbExtension {
  /**
   * Match the extension against file info.
   *
   * @param {object} fileInfo
   * @returns {boolean} If true, render the extension.
   */
  match(fileInfo) {
    return false;
  }

  /**
   * Render the extension as HTML.
   *
   * @param {object} fileInfo
   * @returns {string} HTML to append
   */
  render(fileInfo) {
    return "";
  }
}