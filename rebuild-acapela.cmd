for /f "delims=" %%b in ('node electron-version.js') do @set arch_target=%%b
set arg_arch=%1
set arg_archnum=%2
cd ..\\acapela2 && node-gyp clean && timeout 5 && node-gyp configure --target=v%arg_target% --arch=%arg_arch% && timeout 5 && node ..\\coughdrop_desktop2\\fix_node.js && timeout 5 && node-gyp build && copy build\\Release\\acapela.node acapela.%arg_archnum%.node /Y
