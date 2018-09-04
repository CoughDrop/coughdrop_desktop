for /f "delims=" %%b in ('node electron-version.js') do @set arg_target=%%b
set arg_arch=%1
set arg_archnum=%2
echo REBUILDING FOR v%
cd ..\\acapela && node-gyp clean && timeout 2 && node-gyp configure --target=v%arg_target% --arch=%arg_arch% && timeout 2 && node ..\\coughdrop_desktop\\fix_node.js && timeout 2 && node-gyp build && copy build\\Release\\acapela.node acapela.%arg_archnum%.node /Y
