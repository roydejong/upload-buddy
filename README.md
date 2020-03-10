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

![UbField in action](docs/ss-control-filled.png)

### Configuration
Simply pass in a document query for the `file` input you wish to replace, plus any options:

```javascript
UbField.setup('#the-file', {
  // Define upload target:
  target: "/my_upload_endpoint",

  // Set a built-in language (en, nl):
  lang: "nl",

  // Individual text overrides / translations:
  text: {
    "drop_file": "🔥 Drop it like it's hot 🔥"
  },

  // To show pre-filled file on the UI:
  file: {
    name: "sample.png",
    size: 1024,
    url: "/uploads/sample.png",
    type: "image/png"
  }
});
```

Note: You can set the global default configuration for `UbField` by modifying the value of `UbFieldConfig.defaults`.

### Uploads

#### Client request
Whenever the user selects a file in the UI - either by dropping it on the field or by browsing to it - uploading begins.

On upload, a `POST` HTTP request will be sent to the configured `target` URL. The request will contain form data, with the file data under the `file` key. 

#### Server response

**On success:** Your endpoint should respond with a `200 OK` if the upload was successful. You may include the final file URL as plain-text in your response.

**On failure:** Your endpoint should return any non-200 status code. You may include a plain-text error message in the response body that will be shown to the user.

### Form integration
This field is ideal for form integration. 