for /f "delims=" %%b in ('node electron-version.js') do @set arg_target=%%b
set arg_arch=%1
set arg_archnum=%2
echo REBUILDING FOR v%arch_target%
cd ..\\sapi_tts && node-gyp clean && timeout 2 && node-gyp configure --target=v%arg_target% --arch=%arg_arch% && timeout 2 && node ..\\coughdrop_desktop\\fix_node.js && timeout 2 && node-gyp build && copy build\\Release\\sapi_tts.node sapi_tts.%arg_archnum%.node /Y
