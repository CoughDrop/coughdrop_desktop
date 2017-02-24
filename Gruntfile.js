module.exports = function (grunt) {
    var signing = null;
    try {
        signing = grunt.file.readJSON('../cdcert.json');
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
        setupIcon: 'coughdrop.ico'
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
        setupIcon: 'coughdrop.ico'
    };
    if (signing && signing.password && signing.cert) {
        opts64.certificateFile = signing.cert;
        opts64.certificatePassword = signing.password;
        opts32.certificateFile = signing.cert;
        opts32.certificatePassword = signing.password;
    }
    grunt.initConfig({
        'create-windows-installer': {
            x64: opts64,
            ia32: opts32
        }
    });

    grunt.loadNpmTasks('grunt-electron-installer');

//    grunt.registerTask('installer', ['installer']);
};
