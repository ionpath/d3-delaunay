"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Polygon =
/*#__PURE__*/
function () {
  function Polygon() {
    _classCallCheck(this, Polygon);

    this._ = [];
  }

  _createClass(Polygon, [{
    key: "moveTo",
    value: function moveTo(x, y) {
      this._.push([x, y]);
    }
  }, {
    key: "closePath",
    value: function closePath() {
      this._.push(this._[0].slice());
    }
  }, {
    key: "lineTo",
    value: function lineTo(x, y) {
      this._.push([x, y]);
    }
  }, {
    key: "value",
    value: function value() {
      return this._.length ? this._ : null;
    }
  }]);

  return Polygon;
}();

exports["default"] = Polygon;