# CoughDrop Desktop

Desktop version of CoughDrop app, includes some optional eye-tracking integrations and
premium text-to-speech. Windows-only, currently.

## To Use

```bash
# Clone this repository
$ git clone ...
# Go into the repository
$ cd ...
# Install dependencies and run the app
$ npm install && npm start
```

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

### Dependencies

Someday I'll flesh this out, but in the mean time, here's some notes at least:

- Most dependencies will get installed via `npm install`
- Acapela voices requires dll files from the vendor, and a `data` folder with language and voice files
- LC Technologies requires a vendor-provided dll file, uses contents of `edge` folder
- Tobii EyeX requires dll from vendor
- Compiling node modules for (`eyex`, `acapela`) is super gross, half of it is my fault
  and the other half I blame on node-gyp and windows not playing nice together.
- The `www` folder is populated with compiled content from the main coughdrop repository
  
## Building

To create an executable package:

```bash
npm run package
```

To create Windows installers after creating a package:

```bash
npm run installer
```

If you want to have the code signed (highly recommended or people will get scary-sounding
warnings when trying to install), copy `cdcert.example.json` to `../cdcert.json`, update
with your password, and paste the path to your `cert.pfx` file. NOTE: I don't keep the cert
or password in the app directory so I don't forget and accidentally include 
them where they shouldn't be.

Note that there are some relative paths in `package.json` and `packing_prep.js` that
you may want to get rid of, but I need them for my computer because otherwise it gives
me errors about the full path being too long :-/. Windows development is awesome.

Speaking of Windows, if you're looking to compile for both 64-bit and 32-bit, you'll 
want to check out the following commands (stored in `package.json`):

```bash
npm run install-node-version
npm run rebuild-eyex
npm run rebuild-eyex32
npm run rebuild-acapela
npm run rebuild-acapela32
```

### License

Copyright (C) 2014-2016 CoughDrop, Inc.

Licensed under the AGPLv3 license.
