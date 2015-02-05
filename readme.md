# Teaching Teamwork

Teaching Teamwork was built by [The Concord Consortium](http://concord.org/) for the
[Teaching Teamworks Project](http://concord.org/projects/teaching-teamwork).

See [the app here](concord-consortium.github.io/teaching-teamwork/#two-resistors).

## Building and Running Locally

### Dependencies

* [Node](http://nodejs.org/) `brew install node`
* [Bower](http://bower.io/) `npm install -g bower`
* [Karma](karma-runner.github.io) `npm install -g karma-cli`

We use npm to install the developer tools, and bower to manage the javascript libraries:

```
  npm install
  bower install
```

### Building the library

Breadboard uses [Browserify](http://browserify.org/) to build the script and create the app.js file.

We build automatically and watch for changes using [Gulp](http://gulpjs.com/). Building the dist/ folder is as simple as

```
  npm start
```

Any changes to the script source, the css, or the examples folder will automatically be rebuilt.

### Testing the breadboard library locally

In order to load the example activities in the /examples folder, you just need to serve the contents of the /breadboard directory using a local server, such as Python's SimpleHTTPServer or Live Server.

[Live Server](https://www.npmjs.com/package/live-server) is a simple static server that will automatically reload pages when it detects changes to the source.

```
  npm install -g live-server
  cd dist
  live-server
```

The server runs on port 8080 by default. Open a browser and navigate to

http://localhost:8080/

In combination with Gulp above, this will reload your pages any time any source file is saved.

### Deploying

gh-pages releases are based on the contents of the /dist folder.

To deploy to gh-pages, simply run `npm run deploy`.

### Testing

Tests are written in Jasmine and are run using Karma.

```
  npm test
```

The tests watch for changes and re-run automatically.

### Understanding the code

The TT views are written in [React](http://facebook.github.io/react). React components have a single render() method, which renders DOM elements based on the view's state and properties. The component gets efficiently re-rendered if its
state or properties change.

React [breaks](http://www.code-experience.com/why-you-might-not-need-mvc-with-reactjs/) the traditional MVC pattern, and the view handles much more of the logic and state of the application that we are used to with normal MVC apps. This is ok.

The TT model is contained in Firebase, and is not explicitly re-represented in the app.

## License

Teaching Teamwork is Copyright 2015 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See license.md for the complete license text.
