$ErrorActionPreference = "Stop"
gulp build
.\node_modules\.bin\electron-packager . --platform=win32 --arch=x64 --out=dist --app-version=$npm_package_version --prune --asar --overwrite
Rename-Item .\dist\mooch-win32-x64\ mooch
