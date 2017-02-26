# React Snapshot Server [![Build Status](https://travis-ci.org/scrnhq/react-snapshot-server.svg?branch=master)](https://travis-ci.org/scrnhq/react-snapshot-server) [![Coverage Status](https://coveralls.io/repos/github/scrnhq/react-snapshot-server/badge.svg?branch=master)](https://coveralls.io/github/scrnhq/react-snapshot-server?branch=master)

📸 A zero-configuration server that serves server-rendered snapshots of Create React App

## About
React Snapshot Server is a server based on [zeit/micro](https://github.com/zeit/micro) that creates
snapshots from your [Create React Apps](https://github.com/facebookincubator/create-react-app) on the fly.
This is done by running the application on the server in jsdom and saving the HTML in a snapshot.
The snapshot is then saved and is valid for a given period of time, after that if the page is requested
again a new snapshot will be generated.

## Starting the server

You can start the server by running `node node_modules/react-snapshot-server/bin/cli.js`.
To make this easier you can open up your `package.json` and add the following script
```
  "scripts": {
    ...
    "serve": "react-snapshot-server"
    ...
  },
```

## Options

You can use the following options.

```
Usage: react-snapshot-server [options] [command]

Commands:

  help  Display help

Options:

  -P, --path [value]  The path to the build directory (defaults to "build")
  -p, --port <n>      The port on which the server will be running (defaults to 3000)
  -v, --validity      Time in minutes that a snapshot is valid (defaults to 10)
```

## Installing

Install React Snapshot Server by running `yarn add react-snapshot-server -D`

React Snapshot Server works *almost* out of the box with zero configuration if you use
[Create React App](https://github.com/facebookincubator/create-react-app) we do
require a few little changes, but it only takes a few seconds work!

Open up your `src/index.js` file.
and replace
```diff
- import ReactDOM from 'react-dom';
+ import { render } from 'react-snapshot-server';

- ReactDOM.render(<App />, document.getElementById('root'));
+ render(App, document.getElementById('root'));
```

and that's it, you now have server side rendering!

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/scrnhq/react-snapshot-server/tags).

## Authors

* [Robert van Steen](https://github.com/rovansteen)

See also the list of [contributors](https://github.com/scrnhq/react-snapshot-server/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [next.js](https://github.com/zeit/next.js) for server rendering inspiration.
* [micro](https://github.com/zeit/micro) for awesome async http microservice
* [react-snapshot](https://github.com/geelen/react-snapshot) for the idea of snapshotting as server rendering.
* [create-react-app](https://github.com/facebookincubator/create-react-app) for a react app up and running in seconds.
