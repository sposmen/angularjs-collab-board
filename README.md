# AngularJS Collab Board

A real-time collaboration board using AngularJS and Socket.io.

## How to use angularjs-collab-board

Clone the angularjs-collab-board repository, run `npm install` to grab the dependencies, and start hacking!

### Running the app

Runs like a typical express app:

    node app.js
    
## Develop

### Generate assets once

    node_module/.bin/grunt syncAssets

### Watch code changes generating assets

    node_module/.bin/grunt watch
    
## Resources
Based concept from http://onehungrymind.com/angularjs-sticky-notes-pt-1-architecture/
For more information on AngularJS please check out http://angularjs.org/
For more on Express and Jade, http://expressjs.com/ and http://jade-lang.com/ are your friends.
Big ups to my friend Brian Ford for his Socket.io seed which got me started
https://github.com/btford/angular-socket-io-seed 