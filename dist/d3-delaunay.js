// https://github.com/d3/d3-delaunay v5.0.2 Copyright 2019 Mike Bostock
// https://github.com/mapbox/delaunator v4.0.0. Copyright 2019 Mapbox, Inc.
(function (factory) {
typeof define === 'function' && define.amd ? define(factory) :
factory();
}(function () { 'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Delaunay", {
  enumerable: true,
  get: function get() {
    return _delaunay["default"];
  }
});
Object.defineProperty(exports, "Voronoi", {
  enumerable: true,
  get: function get() {
    return _voronoi["default"];
  }
});

var _delaunay = _interopRequireDefault(require("./delaunay.js"));

var _voronoi = _interopRequireDefault(require("./voronoi.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

}));
