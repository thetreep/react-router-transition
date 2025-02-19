var _excluded = ["render", "component", "path", "exact", "strict", "sensitive", "children"],
    _excluded2 = ["children"];

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

import React, { cloneElement, createElement, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, matchPath, useLocation } from 'react-router-dom';
import TransitionMotion from '@serprex/react-motion/lib/TransitionMotion';
import spring from '@serprex/react-motion/lib/spring'; // Helpers

function ensureSpring(styles) {
  var obj = {};

  for (var key in styles) {
    var value = styles[key];

    if (typeof value === 'number') {
      obj[key] = spring(value);
    } else {
      obj[key] = value;
    }
  }

  return obj;
}

function identity(v) {
  return v;
}

function noop() {} // Components


function RouteTransition(_ref) {
  var children = _ref.children,
      className = _ref.className,
      atEnter = _ref.atEnter,
      atActive = _ref.atActive,
      atLeave = _ref.atLeave,
      _ref$wrapperComponent = _ref.wrapperComponent,
      wrapperComponent = _ref$wrapperComponent === void 0 ? 'div' : _ref$wrapperComponent,
      _ref$didLeave = _ref.didLeave,
      didLeave = _ref$didLeave === void 0 ? noop : _ref$didLeave,
      _ref$mapStyles = _ref.mapStyles,
      mapStyles = _ref$mapStyles === void 0 ? identity : _ref$mapStyles,
      _ref$runOnMount = _ref.runOnMount,
      runOnMount = _ref$runOnMount === void 0 ? false : _ref$runOnMount;
  var defaultStyles = runOnMount === false ? null : children == undefined ? [] : [{
    key: children.key,
    data: children,
    style: atEnter
  }];
  var styles = children == undefined ? [] : [{
    key: children.key,
    data: children,
    style: ensureSpring(atActive)
  }];
  return /*#__PURE__*/React.createElement(TransitionMotion, {
    defaultStyles: defaultStyles,
    styles: styles,
    willEnter: function willEnter() {
      return atEnter;
    },
    willLeave: function willLeave() {
      return ensureSpring(atLeave);
    },
    didLeave: didLeave
  }, function (interpolatedStyles) {
    return /*#__PURE__*/React.createElement("div", {
      className: className
    }, interpolatedStyles.map(function (config) {
      var props = {
        style: mapStyles(config.style),
        key: config.key
      };
      return wrapperComponent !== false ? /*#__PURE__*/createElement(wrapperComponent, props, config.data) : /*#__PURE__*/cloneElement(config.data, props);
    }));
  });
}

RouteTransition.propTypes = {
  className: PropTypes.string,
  wrapperComponent: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.string, PropTypes.func]),
  atEnter: PropTypes.object.isRequired,
  atActive: PropTypes.object.isRequired,
  atLeave: PropTypes.object.isRequired,
  didLeave: PropTypes.func,
  mapStyles: PropTypes.func,
  runOnMount: PropTypes.bool
}; // AnimatedRoute
// The key-getter for RouteTransition. It's either on or off.

function getKey(_ref2, path, exact) {
  var pathname = _ref2.pathname;
  return matchPath(pathname, {
    exact: exact,
    path: path
  }) ? 'match' : 'no-match';
}

function AnimatedRoute(_ref3) {
  var render = _ref3.render,
      component = _ref3.component,
      path = _ref3.path,
      exact = _ref3.exact,
      strict = _ref3.strict,
      sensitive = _ref3.sensitive,
      children = _ref3.children,
      routeTransitionProps = _objectWithoutProperties(_ref3, _excluded);

  var location = useLocation();
  return /*#__PURE__*/React.createElement(RouteTransition, routeTransitionProps, /*#__PURE__*/React.createElement(Route, {
    key: getKey(location, path, exact),
    path: path,
    exact: exact,
    strict: strict,
    sensitive: sensitive,
    location: location,
    component: component,
    render: render,
    children: children
  }));
} // AnimatedSwitch


var NO_MATCH = {
  key: 'no-match'
}; // Not every location object has a `key` property (e.g. HashHistory).

function getLocationKey(location) {
  return typeof location.key === 'string' ? location.key : '';
} // Some superfluous work, but something we need to do in order
// to persist matches/allow for nesting/etc.


function getMatchedRoute(children, _ref4) {
  var pathname = _ref4.pathname;
  var childrenArray = React.Children.toArray(children);

  for (var i = 0; i < childrenArray.length; i++) {
    var child = childrenArray[i];
    var matches = null;

    try {
      matches = matchPath(pathname, {
        exact: child.props.exact,
        path: child.props.path
      });
    } catch (e) {
      matches = null;
    }

    if (matches) {
      return child;
    }
  }

  return NO_MATCH;
}

var counter = 0;

function AnimatedSwitch(_ref5) {
  var children = _ref5.children,
      routeTransitionProps = _objectWithoutProperties(_ref5, _excluded2);

  var location = useLocation();
  var match = useRef(null);
  var key = useRef(null);
  var nextMatch = getMatchedRoute(children, location);

  if (match.current === null) {
    // Persist a reference to the most recent match
    match.current = nextMatch;
    key.current = getLocationKey(location);
  } else if (match.current.key !== nextMatch.key) {
    // Update the key given to Switch anytime the matched route changes
    match.current = nextMatch;
    key.current = getLocationKey(location) + ++counter;
  }

  return /*#__PURE__*/React.createElement(RouteTransition, routeTransitionProps, /*#__PURE__*/React.createElement(Switch, {
    key: key.current,
    location: location
  }, children));
}

export { ensureSpring, spring, RouteTransition, AnimatedRoute, AnimatedSwitch };