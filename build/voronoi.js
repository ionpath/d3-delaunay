"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _path = _interopRequireDefault(require("./path.js"));

var _polygon = _interopRequireDefault(require("./polygon.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Voronoi =
/*#__PURE__*/
function () {
  function Voronoi(delaunay) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0, 960, 500],
        _ref2 = _slicedToArray(_ref, 4),
        xmin = _ref2[0],
        ymin = _ref2[1],
        xmax = _ref2[2],
        ymax = _ref2[3];

    _classCallCheck(this, Voronoi);

    if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");

    var _this$delaunay = this.delaunay = delaunay,
        points = _this$delaunay.points,
        hull = _this$delaunay.hull,
        triangles = _this$delaunay.triangles;

    var circumcenters = this.circumcenters = new Float64Array(triangles.length / 3 * 2);
    var vectors = this.vectors = new Float64Array(points.length * 2);
    this.xmax = xmax, this.xmin = xmin;
    this.ymax = ymax, this.ymin = ymin; // Compute circumcenters.

    for (var i = 0, j = 0, n = triangles.length; i < n; i += 3, j += 2) {
      var t1 = triangles[i] * 2;
      var t2 = triangles[i + 1] * 2;
      var t3 = triangles[i + 2] * 2;
      var _x = points[t1];
      var _y = points[t1 + 1];
      var x2 = points[t2];
      var y2 = points[t2 + 1];
      var x3 = points[t3];
      var y3 = points[t3 + 1];
      var a2 = _x - x2;
      var a3 = _x - x3;
      var b2 = _y - y2;
      var b3 = _y - y3;
      var d1 = _x * _x + _y * _y;
      var d2 = d1 - x2 * x2 - y2 * y2;
      var d3 = d1 - x3 * x3 - y3 * y3;
      var ab = (a3 * b2 - a2 * b3) * 2; // degenerate case (2 points)

      if (!ab) {
        circumcenters[j] = (_x + x3) / 2 + 1e8 * b3;
        circumcenters[j + 1] = (_y + y3) / 2 - 1e8 * a3;
      } else {
        circumcenters[j] = (b2 * d3 - b3 * d2) / ab;
        circumcenters[j + 1] = (a3 * d2 - a2 * d3) / ab;
      }
    } // Compute exterior cell rays.


    var h = hull[hull.length - 1];
    var p0,
        p1 = h * 4;
    var x0,
        x1 = points[2 * h];
    var y0,
        y1 = points[2 * h + 1];

    for (var _i2 = 0; _i2 < hull.length; ++_i2) {
      h = hull[_i2];
      p0 = p1, x0 = x1, y0 = y1;
      p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
      vectors[p0 + 2] = vectors[p1] = y0 - y1;
      vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
    }
  }

  _createClass(Voronoi, [{
    key: "render",
    value: function render(context) {
      var buffer = context == null ? context = new _path["default"]() : undefined;
      var _this$delaunay2 = this.delaunay,
          halfedges = _this$delaunay2.halfedges,
          inedges = _this$delaunay2.inedges,
          hull = _this$delaunay2.hull,
          circumcenters = this.circumcenters,
          vectors = this.vectors;
      if (hull.length <= 1) return null;

      for (var i = 0, n = halfedges.length; i < n; ++i) {
        var j = halfedges[i];
        if (j < i) continue;
        var ti = Math.floor(i / 3) * 2;
        var tj = Math.floor(j / 3) * 2;
        var xi = circumcenters[ti];
        var yi = circumcenters[ti + 1];
        var xj = circumcenters[tj];
        var yj = circumcenters[tj + 1];

        this._renderSegment(xi, yi, xj, yj, context);
      }

      var h0,
          h1 = hull[hull.length - 1];

      for (var _i3 = 0; _i3 < hull.length; ++_i3) {
        h0 = h1, h1 = hull[_i3];
        var t = Math.floor(inedges[h1] / 3) * 2;
        var x = circumcenters[t];
        var y = circumcenters[t + 1];
        var v = h0 * 4;

        var p = this._project(x, y, vectors[v + 2], vectors[v + 3]);

        if (p) this._renderSegment(x, y, p[0], p[1], context);
      }

      return buffer && buffer.value();
    }
  }, {
    key: "renderBounds",
    value: function renderBounds(context) {
      var buffer = context == null ? context = new _path["default"]() : undefined;
      context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
      return buffer && buffer.value();
    }
  }, {
    key: "renderCell",
    value: function renderCell(i, context) {
      var buffer = context == null ? context = new _path["default"]() : undefined;

      var points = this._clip(i);

      if (points === null) return;
      context.moveTo(points[0], points[1]);

      for (var _i4 = 2, n = points.length; _i4 < n; _i4 += 2) {
        context.lineTo(points[_i4], points[_i4 + 1]);
      }

      context.closePath();
      return buffer && buffer.value();
    }
  }, {
    key: "cellPolygons",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function cellPolygons() {
      var points, i, n, cell;
      return regeneratorRuntime.wrap(function cellPolygons$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              points = this.delaunay.points;
              i = 0, n = points.length / 2;

            case 2:
              if (!(i < n)) {
                _context.next = 10;
                break;
              }

              cell = this.cellPolygon(i);

              if (!cell) {
                _context.next = 7;
                break;
              }

              _context.next = 7;
              return cell;

            case 7:
              ++i;
              _context.next = 2;
              break;

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, cellPolygons, this);
    })
  }, {
    key: "cellPolygon",
    value: function cellPolygon(i) {
      var polygon = new _polygon["default"]();
      this.renderCell(i, polygon);
      return polygon.value();
    }
  }, {
    key: "_renderSegment",
    value: function _renderSegment(x0, y0, x1, y1, context) {
      var S;

      var c0 = this._regioncode(x0, y0);

      var c1 = this._regioncode(x1, y1);

      if (c0 === 0 && c1 === 0) {
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
      } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
        context.moveTo(S[0], S[1]);
        context.lineTo(S[2], S[3]);
      }
    }
  }, {
    key: "contains",
    value: function contains(i, x, y) {
      if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
      return this.delaunay._step(i, x, y) === i;
    }
  }, {
    key: "_cell",
    value: function _cell(i) {
      var circumcenters = this.circumcenters,
          _this$delaunay3 = this.delaunay,
          inedges = _this$delaunay3.inedges,
          halfedges = _this$delaunay3.halfedges,
          triangles = _this$delaunay3.triangles;
      var e0 = inedges[i];
      if (e0 === -1) return null; // coincident point

      var points = [];
      var e = e0;

      do {
        var t = Math.floor(e / 3);
        points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
        e = e % 3 === 2 ? e - 2 : e + 1;
        if (triangles[e] !== i) break; // bad triangulation

        e = halfedges[e];
      } while (e !== e0 && e !== -1);

      return points;
    }
  }, {
    key: "_clip",
    value: function _clip(i) {
      // degenerate case (1 valid point: return the box)
      if (i === 0 && this.delaunay.hull.length === 1) {
        return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
      }

      var points = this._cell(i);

      if (points === null) return null;
      var V = this.vectors;
      var v = i * 4;
      return V[v] || V[v + 1] ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3]) : this._clipFinite(i, points);
    }
  }, {
    key: "_clipFinite",
    value: function _clipFinite(i, points) {
      var n = points.length;
      var P = null;
      var x0,
          y0,
          x1 = points[n - 2],
          y1 = points[n - 1];

      var c0,
          c1 = this._regioncode(x1, y1);

      var e0, e1;

      for (var j = 0; j < n; j += 2) {
        x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
        c0 = c1, c1 = this._regioncode(x1, y1);

        if (c0 === 0 && c1 === 0) {
          e0 = e1, e1 = 0;
          if (P) P.push(x1, y1);else P = [x1, y1];
        } else {
          var S = void 0,
              sx0 = void 0,
              sy0 = void 0,
              sx1 = void 0,
              sy1 = void 0;

          if (c0 === 0) {
            if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
            var _S = S;

            var _S2 = _slicedToArray(_S, 4);

            sx0 = _S2[0];
            sy0 = _S2[1];
            sx1 = _S2[2];
            sy1 = _S2[3];
          } else {
            if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
            var _S3 = S;

            var _S4 = _slicedToArray(_S3, 4);

            sx1 = _S4[0];
            sy1 = _S4[1];
            sx0 = _S4[2];
            sy0 = _S4[3];
            e0 = e1, e1 = this._edgecode(sx0, sy0);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx0, sy0);else P = [sx0, sy0];
          }

          e0 = e1, e1 = this._edgecode(sx1, sy1);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
          if (P) P.push(sx1, sy1);else P = [sx1, sy1];
        }
      }

      if (P) {
        e0 = e1, e1 = this._edgecode(P[0], P[1]);
        if (e0 && e1) this._edge(i, e0, e1, P, P.length);
      } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
        return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
      }

      return P;
    }
  }, {
    key: "_clipSegment",
    value: function _clipSegment(x0, y0, x1, y1, c0, c1) {
      while (true) {
        if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
        if (c0 & c1) return null;
        var x = void 0,
            y = void 0,
            c = c0 || c1;
        if (c & 8) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;else if (c & 4) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;else if (c & 2) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
        if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
      }
    }
  }, {
    key: "_clipInfinite",
    value: function _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
      var P = Array.from(points),
          p;
      if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
      if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);

      if (P = this._clipFinite(i, P)) {
        for (var j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
          c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
          if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
        }
      } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
        P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
      }

      return P;
    }
  }, {
    key: "_edge",
    value: function _edge(i, e0, e1, P, j) {
      while (e0 !== e1) {
        var x = void 0,
            y = void 0;

        switch (e0) {
          case 5:
            e0 = 4;
            continue;
          // top-left

          case 4:
            e0 = 6, x = this.xmax, y = this.ymin;
            break;
          // top

          case 6:
            e0 = 2;
            continue;
          // top-right

          case 2:
            e0 = 10, x = this.xmax, y = this.ymax;
            break;
          // right

          case 10:
            e0 = 8;
            continue;
          // bottom-right

          case 8:
            e0 = 9, x = this.xmin, y = this.ymax;
            break;
          // bottom

          case 9:
            e0 = 1;
            continue;
          // bottom-left

          case 1:
            e0 = 5, x = this.xmin, y = this.ymin;
            break;
          // left
        }

        if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
          P.splice(j, 0, x, y), j += 2;
        }
      }

      return j;
    }
  }, {
    key: "_project",
    value: function _project(x0, y0, vx, vy) {
      var t = Infinity,
          c,
          x,
          y;

      if (vy < 0) {
        // top
        if (y0 <= this.ymin) return null;
        if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
      } else if (vy > 0) {
        // bottom
        if (y0 >= this.ymax) return null;
        if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
      }

      if (vx > 0) {
        // right
        if (x0 >= this.xmax) return null;
        if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
      } else if (vx < 0) {
        // left
        if (x0 <= this.xmin) return null;
        if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
      }

      return [x, y];
    }
  }, {
    key: "_edgecode",
    value: function _edgecode(x, y) {
      return (x === this.xmin ? 1 : x === this.xmax ? 2 : 0) | (y === this.ymin ? 4 : y === this.ymax ? 8 : 0);
    }
  }, {
    key: "_regioncode",
    value: function _regioncode(x, y) {
      return (x < this.xmin ? 1 : x > this.xmax ? 2 : 0) | (y < this.ymin ? 4 : y > this.ymax ? 8 : 0);
    }
  }]);

  return Voronoi;
}();

exports["default"] = Voronoi;