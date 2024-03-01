# CoughDrop Desktop

Desktop version of CoughDrop app, includes some optional eye-tracking integrations and
premium text-to-speech. Windows-only, currently.

## To Use

Requires node, npm, grunt
```bash
# Clone this repository
$ git clone ...
# Go into the repository
$ cd ...
# Install dependencies and run the app
$ npm install
$ npm start
```

If using the eye tracking libraries you may need to recompile them (especially if you update your Electron version)
```bash
$ npm run install-node-version
$ npm run rebuild-eyex
$ npm run rebuild-eyex32
# You'll need to change package.json to point to the correct eyex local directory
$ npm run install-eyex
$ npm run rebuild-acapela
$ npm run rebuild-acapela32
# You'll need to change package.json to point to the correct acapela local directory
$ npm run install-acapela
$ npm run rebuild-sapi
$ npm run rebuild-sapi32
# You'll need to change package.json to point to the correct sapi_tts local library directory
$ npm run install-sapi
```

64 and 32-bit libraries are compiled separately for these eye tracking tools. 

Creating a Windows installer is relatively straightforward. If you want a signed package, you'll copy `cdcert.examplejson`
and set the location and password for the app signing key.

```bash
$ npm run package
# Try launching the compiled version at cdb/CoughDrop-win32-XXXX
$ npm run installer

### Dependencies

Someday I'll flesh this out, but in the mean time, here's some notes at least:

- Most dependencies will get installed via `npm install`
- Acapela voices requires dll files from the vendor, voice and language files will be stored in user profile directories as downloaded
- LC Technologies requires a vendor-provided dll file, uses contents of `edge` folder
- Tobii EyeX requires dll and other files from the vendor
- Compiling node modules for (`eyex`, `acapela`) is super gross, half of it is my fault
  and the other half I blame on node-gyp and windows not playing nice together.
- The `www` folder is populated with compiled content from the main coughdrop repository, 
  as well as some helper libraries that are used by the main app's `capabilities.js` file.
  
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

## Testing 
Desktop apps, in theory, should run the same as the web version. It is important to test your functionality first on the web, where it is easier to iterate and re-release. If there is an issue on desktop, it's easier to isolate, as it will most likely be found in the desktop source code.

Some areas are more fragile than others. When you first build an app package from a new device or new Electron build, you will want to test the following features to ensure they are working correctly, as misconfigured libraries are possible any time you set things up on a new computer. Remember that some libraries need to be re-compiled for the specific version of Electron that you are using (see above).

- Login works correctly
- Sync works correctly
- After sync, close the app, turn off wifi and load the app, symbols should still load correctly
- Speak Mode should automatically go full screen
- In user Preferences under voice, Premium Voices should show download link
- Premium Voices should download correctly when clicked
- Premium Voices should output speech correctly when selected in Preferences
- A button that links to a YouTube video should correctly play the video when selected in Speak Mode
- EyeX or other eye gaze tracking library should work correctly


### License

Copyright (C) 2014-2018 CoughDrop, Inc.

Licensed under MIT license.
