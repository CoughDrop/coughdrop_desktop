for /f "delims=" %%b in ('node electron-version.js') do @set arg_target=%%b
set arg_arch=%1
set arg_archnum=%2
cd ..\\eyex && copy Tobii.EyeX.Client.%arg_archnum%.lib Tobii.EyeX.Client.lib /Y && node-gyp clean && timeout 2 && node-gyp configure --target=%arg_target% --arch=%arg_arch% && timeout 2 && node ..\\coughdrop_desktop\\fix_node.js && timeout 2 && node-gyp build && copy build\\Release\\eyex.node eyex.%arg_archnum%.node /Y
