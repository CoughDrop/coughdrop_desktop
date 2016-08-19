// Fix for Electron and Ember using different require methods,
// see https://github.com/atom/electron/issues/3423
window.nodeModule = window.module;
window.requireNode = window.nodeModule.require;
window.module = undefined;
