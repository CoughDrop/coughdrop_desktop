module.exports = function (grunt) {
    grunt.initConfig({
        'create-windows-installer': {
            x64: {
                appDirectory: './build/CoughDrop-win32-x64',
                outputDirectory: './build/installer/64',
                authors: 'CoughDrop, Inc.',
                exe: 'coughdrop.exe'
            },
            ia32: {
                appDirectory: './build/CoughDrop-win32-ia32',
                outputDirectory: './build/installer/32',
                authors: 'CoughDrop, Inc.',
                exe: 'coughdrop.exe'
            }
        }
    });

    grunt.loadNpmTasks('grunt-electron-installer');

//    grunt.registerTask('installer', ['installer']);
};