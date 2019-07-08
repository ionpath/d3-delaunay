"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var epsilon = 1e-6;

var Path =
/*#__PURE__*/
function () {
  function Path() {
    _classCallCheck(this, Path);

    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath

    this._ = "";
  }

  _createClass(Path, [{
    key: "moveTo",
    value: function moveTo(x, y) {
      this._ += "M".concat(this._x0 = this._x1 = +x, ",").concat(this._y0 = this._y1 = +y);
    }
  }, {
    key: "closePath",
    value: function closePath() {
      if (this._x1 !== null) {
        this._x1 = this._x0, this._y1 = this._y0;
        this._ += "Z";
      }
    }
  }, {
    key: "lineTo",
    value: function lineTo(x, y) {
      this._ += "L".concat(this._x1 = +x, ",").concat(this._y1 = +y);
    }
  }, {
    key: "arc",
    value: function arc(x, y, r) {
      x = +x, y = +y, r = +r;
      var x0 = x + r;
      var y0 = y;
      if (r < 0) throw new Error("negative radius");
      if (this._x1 === null) this._ += "M".concat(x0, ",").concat(y0);else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
      if (!r) return;
      this._ += "A".concat(r, ",").concat(r, ",0,1,1,").concat(x - r, ",").concat(y, "A").concat(r, ",").concat(r, ",0,1,1,").concat(this._x1 = x0, ",").concat(this._y1 = y0);
    }
  }, {
    key: "rect",
    value: function rect(x, y, w, h) {
      this._ += "M".concat(this._x0 = this._x1 = +x, ",").concat(this._y0 = this._y1 = +y, "h").concat(+w, "v").concat(+h, "h").concat(-w, "Z");
    }
  }, {
    key: "value",
    value: function value() {
      return this._ || null;
    }
  }]);

  return Path;
}();

exports["default"] = Path;