Mooch
=====

Hacky home automation.

Local dev
---------

```
npm install
bower install
tsd install
gulp watch
npm start
```

Package
-------

```
gulp build
electron-packager . --platform=win32 --arch=x64 --out=dist --app-version=$npm_package_version --prune --asar --overwrite
```

Copyright (c) 2016 Matt Dwen
