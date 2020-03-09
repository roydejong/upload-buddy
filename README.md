# 💚 Upload Buddy
**Upload Buddy is a lightweight JavaScript library that makes it easy to integrate smart, interactive file uploads into any application, without any dependencies.**

## Setup
This package is available for installation via npm as `release-buddy`:

```shell script
yarn install release-buddy
```

Alternatively, you can self-host by grabbing the files you need from the `dist` folder in this repository.

Simply include `upbud.min.js` from `dist` on any page you want to use the library. If you want to use the default CSS styles, you'll also need to include `default.css`:

```html
<script src="upload-buddy/dist/upbud.min.js"></script>
<link rel="stylesheet" href="upload-buddy/dist/default.css"/>
```

**Once included, you can make use of the various components in this library, detailed in the sections below.**

## `UbField`

### Features
UbField is a user-friendly, drop-in replacement for your existing `file` upload field in any HTML form. It offers the following features:

- 😊 User-friendly UI with drag & drop support
- ⬆ Direct server upload via Ajax
- ⭐ Useful extensions for supported file types (e.g. preview, image cropping, etc)

### Configuration
Simply pass in a document query for the `file` input you wish to replace, plus any options:

```javascript
UbField.setup('#the-file', {
  // Built-in languages: en, nl
  lang: "nl",

  // Custom text overrides / translations
  text: {
    "drop_file": "🔥 Drop it like it's hot 🔥"
  },
});
```

Note: You can set the global default configuration for `UbField` by modifying the value of `UbFieldConfig.defaults`.
