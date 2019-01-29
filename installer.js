var electronInstaller = require('electron-winstaller');
var fs = require('fs');

var signing = null;
try {
    var data = fs.readFileSync('../cdcert.json', 'utf8');
    var signing = JSON.parse(data);
} catch (e) { }
var opts64 = {
    appDirectory: '../cdb/CoughDrop-win32-x64',
    outputDirectory: '../cdb/inst/64',
    authors: 'CoughDrop, Inc.',
    exe: 'coughdrop.exe',
    title: 'CoughDrop',
    iconUrl: 'https://www.mycoughdrop.com/app.ico',
    loadingGif: 'loading.gif',
    remoteReleases: 'https://s3.amazonaws.com/coughdrop/installer/windows/x64',
    setupIcon: 'coughdrop.ico',
    setupExe: 'coughdrop-setup.exe',
    setupMsi: 'coughdrop-setup.msi',
    noMsi: true
};
var opts32 = {
    appDirectory: '../cdb/CoughDrop-win32-ia32',
    outputDirectory: '../cdb/inst/32',
    authors: 'CoughDrop, Inc.',
    exe: 'coughdrop.exe',
    title: 'CoughDrop',
    iconUrl: 'https://www.mycoughdrop.com/app.ico',
    loadingGif: 'loading.gif',
    remoteReleases: 'https://s3.amazonaws.com/coughdrop/installer/windows/ia32',
    setupIcon: 'coughdrop.ico',
    setupExe: 'coughdrop-setup.exe',
    setupMsi: 'coughdrop-setup.msi',
    noMsi: true
};
if (signing && signing.password && signing.cert) {
    opts64.certificateFile = signing.cert;
    opts64.certificatePassword = signing.password;
    opts32.certificateFile = signing.cert;
    opts32.certificatePassword = signing.password;
    console.log("CERT FOUND, signing with local cert");
}

console.log("generating 64-bit version");

var promise1 = electronInstaller.createWindowsInstaller(opts64);
var promise2 = null;
promise1.then(function(res) {
    console.log("64-bit version completed! generating 32-bit version");
    promise2 = electronInstaller.createWindowsInstaller(opts32);
    promise2.then(function(res) {
        console.log("32-bit version completed!");
    }, function(err) {
        console.log("error with 32-bit version", err);
    });
}, function(err) {
    console.log("error with 64-bit version", err);
});
