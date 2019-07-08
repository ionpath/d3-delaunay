"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _delaunator = _interopRequireDefault(require("delaunator"));

var _path = _interopRequireDefault(require("./path.js"));

var _polygon = _interopRequireDefault(require("./polygon.js"));

var _voronoi = _interopRequireDefault(require("./voronoi.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked =
/*#__PURE__*/
regeneratorRuntime.mark(flatIterable);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var tau = 2 * Math.PI;

function pointX(p) {
  return p[0];
}

function pointY(p) {
  return p[1];
}

function area(hull, points) {
  var n = hull.length,
      x0,
      y0,
      x1 = points[2 * hull[n - 1]],
      y1 = points[2 * hull[n - 1] + 1],
      area = 0;

  for (var i = 0; i < n; i++) {
    x0 = x1, y0 = y1;
    x1 = points[2 * hull[i]];
    y1 = points[2 * hull[i] + 1];
    area += y0 * x1 - x0 * y1;
  }

  return area / 2;
}

function jitter(x, y, r) {
  return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
}

var Delaunay =
/*#__PURE__*/
function () {
  function Delaunay(points) {
    _classCallCheck(this, Delaunay);

    this._delaunator = new _delaunator["default"](points);
    this.inedges = new Int32Array(points.length / 2);
    this._hullIndex = new Int32Array(points.length / 2);
    this.points = this._delaunator.coords;

    this._init();
  }

  _createClass(Delaunay, [{
    key: "update",
    value: function update() {
      this._delaunator.update();

      this._init();
    }
  }, {
    key: "_init",
    value: function _init() {
      var d = this._delaunator,
          points = this.points; // check for collinear

      if (d.hull && d.hull.length > 2 && area(d.hull, points) < 1e-10) {
        this.collinear = Int32Array.from({
          length: points.length / 2
        }, function (_, i) {
          return i;
        }).sort(function (i, j) {
          return points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1];
        }); // for exact neighbors

        var e = this.collinear[0],
            f = this.collinear[this.collinear.length - 1],
            bounds = [points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1]],
            r = 1e-8 * Math.sqrt(Math.pow(bounds[3] - bounds[1], 2) + Math.pow(bounds[2] - bounds[0], 2));

        for (var i = 0, n = points.length / 2; i < n; ++i) {
          var p = jitter(points[2 * i], points[2 * i + 1], r);
          points[2 * i] = p[0];
          points[2 * i + 1] = p[1];
        }

        this._delaunator = new _delaunator["default"](points);
      } else {
        delete this.collinear;
      }

      var halfedges = this.halfedges = this._delaunator.halfedges;
      var hull = this.hull = this._delaunator.hull;
      var triangles = this.triangles = this._delaunator.triangles;
      var inedges = this.inedges.fill(-1);

      var hullIndex = this._hullIndex.fill(-1); // Compute an index from each point to an (arbitrary) incoming halfedge
      // Used to give the first neighbor of each point; for this reason,
      // on the hull we give priority to exterior halfedges


      for (var _e = 0, _n = halfedges.length; _e < _n; ++_e) {
        var _p = triangles[_e % 3 === 2 ? _e - 2 : _e + 1];
        if (halfedges[_e] === -1 || inedges[_p] === -1) inedges[_p] = _e;
      }

      for (var _i = 0, _n2 = hull.length; _i < _n2; ++_i) {
        hullIndex[hull[_i]] = _i;
      } // degenerate case: 1 or 2 (distinct) points


      if (hull.length <= 2 && hull.length > 0) {
        this.triangles = new Int32Array(3).fill(-1);
        this.halfedges = new Int32Array(3).fill(-1);
        this.triangles[0] = hull[0];
        this.triangles[1] = hull[1];
        this.triangles[2] = hull[1];
        inedges[hull[0]] = 1;
        if (hull.length === 2) inedges[hull[1]] = 0;
      }
    }
  }, {
    key: "voronoi",
    value: function voronoi(bounds) {
      return new _voronoi["default"](this, bounds);
    }
  }, {
    key: "neighbors",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function neighbors(i) {
      var inedges, hull, _hullIndex, halfedges, triangles, l, e0, e, p0, p;

      return regeneratorRuntime.wrap(function neighbors$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              inedges = this.inedges, hull = this.hull, _hullIndex = this._hullIndex, halfedges = this.halfedges, triangles = this.triangles; // degenerate case with several collinear points

              if (!this.collinear) {
                _context.next = 10;
                break;
              }

              l = this.collinear.indexOf(i);

              if (!(l > 0)) {
                _context.next = 6;
                break;
              }

              _context.next = 6;
              return this.collinear[l - 1];

            case 6:
              if (!(l < this.collinear.length - 1)) {
                _context.next = 9;
                break;
              }

              _context.next = 9;
              return this.collinear[l + 1];

            case 9:
              return _context.abrupt("return");

            case 10:
              e0 = inedges[i];

              if (!(e0 === -1)) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("return");

            case 13:
              // coincident point
              e = e0, p0 = -1;

            case 14:
              _context.next = 16;
              return p0 = triangles[e];

            case 16:
              e = e % 3 === 2 ? e - 2 : e + 1;

              if (!(triangles[e] !== i)) {
                _context.next = 19;
                break;
              }

              return _context.abrupt("return");

            case 19:
              // bad triangulation
              e = halfedges[e];

              if (!(e === -1)) {
                _context.next = 26;
                break;
              }

              p = hull[(_hullIndex[i] + 1) % hull.length];

              if (!(p !== p0)) {
                _context.next = 25;
                break;
              }

              _context.next = 25;
              return p;

            case 25:
              return _context.abrupt("return");

            case 26:
              if (e !== e0) {
                _context.next = 14;
                break;
              }

            case 27:
            case "end":
              return _context.stop();
          }
        }
      }, neighbors, this);
    })
  }, {
    key: "find",
    value: function find(x, y) {
      var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
      var i0 = i;
      var c;

      while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) {
        i = c;
      }

      return c;
    }
  }, {
    key: "_step",
    value: function _step(i, x, y) {
      var inedges = this.inedges,
          points = this.points;
      if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
      var c = i;
      var dc = Math.pow(x - points[i * 2], 2) + Math.pow(y - points[i * 2 + 1], 2);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.neighbors(i)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion = (_step2 = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var t = _step2.value;
          var dt = Math.pow(x - points[t * 2], 2) + Math.pow(y - points[t * 2 + 1], 2);
          if (dt < dc) dc = dt, c = t;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return c;
    }
  }, {
    key: "render",
    value: function render(context) {
      var buffer = context == null ? context = new _path["default"]() : undefined;
      var points = this.points,
          halfedges = this.halfedges,
          triangles = this.triangles;

      for (var i = 0, n = halfedges.length; i < n; ++i) {
        var j = halfedges[i];
        if (j < i) continue;
        var ti = triangles[i] * 2;
        var tj = triangles[j] * 2;
        context.moveTo(points[ti], points[ti + 1]);
        context.lineTo(points[tj], points[tj + 1]);
      }

      this.renderHull(context);
      return buffer && buffer.value();
    }
  }, {
    key: "renderPoints",
    value: function renderPoints(context) {
      var r = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      var buffer = context == null ? context = new _path["default"]() : undefined;
      var points = this.points;

      for (var i = 0, n = points.length; i < n; i += 2) {
        var x = points[i],
            y = points[i + 1];
        context.moveTo(x + r, y);
        context.arc(x, y, r, 0, tau);
      }

      return buffer && buffer.value();
    }
  }, {
    key: "renderHull",
    value: function renderHull(context) {
      var buffer = context == null ? context = new _path["default"]() : undefined;
      var hull = this.hull,
          points = this.points;
      var h = hull[0] * 2,
          n = hull.length;
      context.moveTo(points[h], points[h + 1]);

      for (var i = 1; i < n; ++i) {
        var _h = 2 * hull[i];

        context.lineTo(points[_h], points[_h + 1]);
      }

      context.closePath();
      return buffer && buffer.value();
    }
  }, {
    key: "hullPolygon",
    value: function hullPolygon() {
      var polygon = new _polygon["default"]();
      this.renderHull(polygon);
      return polygon.value();
    }
  }, {
    key: "renderTriangle",
    value: function renderTriangle(i, context) {
      var buffer = context == null ? context = new _path["default"]() : undefined;
      var points = this.points,
          triangles = this.triangles;
      var t0 = triangles[i *= 3] * 2;
      var t1 = triangles[i + 1] * 2;
      var t2 = triangles[i + 2] * 2;
      context.moveTo(points[t0], points[t0 + 1]);
      context.lineTo(points[t1], points[t1 + 1]);
      context.lineTo(points[t2], points[t2 + 1]);
      context.closePath();
      return buffer && buffer.value();
    }
  }, {
    key: "trianglePolygons",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function trianglePolygons() {
      var triangles, i, n;
      return regeneratorRuntime.wrap(function trianglePolygons$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              triangles = this.triangles;
              i = 0, n = triangles.length / 3;

            case 2:
              if (!(i < n)) {
                _context2.next = 8;
                break;
              }

              _context2.next = 5;
              return this.trianglePolygon(i);

            case 5:
              ++i;
              _context2.next = 2;
              break;

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, trianglePolygons, this);
    })
  }, {
    key: "trianglePolygon",
    value: function trianglePolygon(i) {
      var polygon = new _polygon["default"]();
      this.renderTriangle(i, polygon);
      return polygon.value();
    }
  }]);

  return Delaunay;
}();

exports["default"] = Delaunay;

Delaunay.from = function (points) {
  var fx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : pointX;
  var fy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : pointY;
  var that = arguments.length > 3 ? arguments[3] : undefined;
  return new Delaunay("length" in points ? flatArray(points, fx, fy, that) : Float64Array.from(flatIterable(points, fx, fy, that)));
};

function flatArray(points, fx, fy, that) {
  var n = points.length;
  var array = new Float64Array(n * 2);

  for (var i = 0; i < n; ++i) {
    var p = points[i];
    array[i * 2] = fx.call(that, p, i, points);
    array[i * 2 + 1] = fy.call(that, p, i, points);
  }

  return array;
}

function flatIterable(points, fx, fy, that) {
  var i, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step3, p;

  return regeneratorRuntime.wrap(function flatIterable$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          i = 0;
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context3.prev = 4;
          _iterator2 = points[Symbol.iterator]();

        case 6:
          if (_iteratorNormalCompletion2 = (_step3 = _iterator2.next()).done) {
            _context3.next = 16;
            break;
          }

          p = _step3.value;
          _context3.next = 10;
          return fx.call(that, p, i, points);

        case 10:
          _context3.next = 12;
          return fy.call(that, p, i, points);

        case 12:
          ++i;

        case 13:
          _iteratorNormalCompletion2 = true;
          _context3.next = 6;
          break;

        case 16:
          _context3.next = 22;
          break;

        case 18:
          _context3.prev = 18;
          _context3.t0 = _context3["catch"](4);
          _didIteratorError2 = true;
          _iteratorError2 = _context3.t0;

        case 22:
          _context3.prev = 22;
          _context3.prev = 23;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 25:
          _context3.prev = 25;

          if (!_didIteratorError2) {
            _context3.next = 28;
            break;
          }

          throw _iteratorError2;

        case 28:
          return _context3.finish(25);

        case 29:
          return _context3.finish(22);

        case 30:
        case "end":
          return _context3.stop();
      }
    }
  }, _marked, null, [[4, 18, 22, 30], [23,, 25, 29]]);
}