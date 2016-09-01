module.exports = function (grunt) {
    grunt.initConfig({
        'create-windows-installer': {
            x64: {
                appDirectory: '../cdb/CoughDrop-win32-x64',
                outputDirectory: '../cdb/inst/64',
                authors: 'CoughDrop, Inc.',
                exe: 'coughdrop.exe',
                title: 'CoughDrop',
                iconUrl: 'https://www.mycoughdrop.com/app.ico',
                loadingGif: 'loading.gif',
                remoteReleases: 'https://s3.amazonaws.com/coughdrop/installer/windows/x64',
                setupIcon: 'coughdrop.ico'
            },
            ia32: {
                appDirectory: '../cdb/CoughDrop-win32-ia32',
                outputDirectory: '../cdb/inst/32',
                authors: 'CoughDrop, Inc.',
                exe: 'coughdrop.exe',
                title: 'CoughDrop',
                iconUrl: 'https://www.mycoughdrop.com/app.ico',
                loadingGif: 'loading.gif',
                remoteReleases: 'https://s3.amazonaws.com/coughdrop/installer/windows/ia32',
                setupIcon: 'coughdrop.ico'
            }
        }
    });

    grunt.loadNpmTasks('grunt-electron-installer');

//    grunt.registerTask('installer', ['installer']);
};
