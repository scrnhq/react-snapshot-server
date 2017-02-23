'use strict'; // eslint-disable-line

var React = require('react');
var ReactDOM = require('react-dom');

/**
 * Render the component passed in.
 * If the environment is JSDom, we expose the AppComponent so that
 * we can render it to a string & pass in the initial props.
 *
 * If the environment is a regular browser, we just render it.
 *
 * @param  {ReactComponent} AppComponent
 * @param  {Node} DOMElement
 * @return {void}
 */
function render(AppComponent, DOMElement) {
  if (navigator.userAgent.match(/Node\.js/i)) {
    window.app = AppComponent;
  } else {
    var initialProps = window.__INITIAL_PROPS__;
    var AppWithProps = React.createElement(AppComponent, initialProps);
    ReactDOM.render(AppWithProps, DOMElement);
  }
}

module.exports = {
  render: render
};
