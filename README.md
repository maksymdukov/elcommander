## ELCommander
(WIP)
Plugin-extensible file manager for Linux written in JS (Electron)

## Demo video
[![ELCommander](http://img.youtube.com/vi/oQUO1B76xtY/0.jpg)](http://www.youtube.com/watch?v=oQUO1B76xtY "ELCommander")

## Features

- Typescript
- SDK for community plugin development (currently FileSystem plugins are only available)
- Hot plugin activation system
- Download and Update plugins using official npm registry
- plugins can work in Web Workers in order to avoid abusing UI thread
- external google drive plugin
- inbuilt local fs plugin
- Dolphin-like fs tree view
- optimised for large file lists (windowing technique)
- drag and drop
- lasso

## Used technologies and libs
- Electron
- Typescript
- Electron react boilerplate (customized)
- React, Redux toolkit, thunk
- React JSS
- React query
- React Window
- Comlink (for convenient webworker communication)
