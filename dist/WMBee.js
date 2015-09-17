(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'bluebird'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('bluebird'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.Promise);
    global.WMBee = mod.exports;
  }
})(this, function (exports, module, _bluebird) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var _Promise = _interopRequireDefault(_bluebird);

  var WMBee = (function () {
    function WMBee() {
      _classCallCheck(this, WMBee);

      this.attached = [];
    }

    WMBee.prototype.set = function set(val) {
      this.attached.forEach(function (bee) {
        if (bee.next && typeof bee.next === 'function') {
          var nextVal = bee.next(val);

          if (!bee.halt) {
            bee.set(nextVal);
          } else if (typeof bee.halt === 'number') {
            setTimeout(bee.set.bind(bee, val), bee.halt);
          }
        }
      });
    };

    WMBee.prototype.filter = function filter(callback) {
      var bee = new WMBee();

      bee.next = function (val) {
        bee.halt = true;

        if (typeof callback === 'function') {
          bee.halt = !callback(val);
        }

        return val;
      };

      this.attached.push(bee);

      return bee;
    };

    WMBee.prototype.map = function map(callback) {
      var bee = new WMBee();

      bee.next = function (val) {
        var mappedVal = val;

        if (typeof callback === 'function') {
          mappedVal = callback(val);
        } else {
          // TODO: Warn map called without callback
        }

        return mappedVal;
      };

      this.attached.push(bee);

      return bee;
    };

    WMBee.prototype.onValue = function onValue(callback) {
      var bee = new WMBee();

      bee.next = function (val) {
        if (typeof callback === 'function') {
          callback(val);
        } else {
          // TODO: warn in debug
        }

        return val;
      };

      this.attached.push(bee);

      return bee;
    };

    WMBee.prototype.delay = function delay(pause) {
      var bee = new WMBee();

      bee.next = function (val) {
        return val;
      };

      if (typeof pause === 'number') {
        bee.halt = pause;
      } else {
        //TODO: warn in debug
      }

      this.attached.push(bee);

      return bee;
    };

    WMBee.prototype.toPromise = function toPromise() {
      var bee = new WMBee(),
          promise = new _Promise['default'](function (resolve) {
        bee.next = resolve;
      });

      this.attached.push(bee);

      return promise;
    };

    WMBee.prototype.unique = function unique() {
      var bee = new WMBee();
      bee.ignore = [];

      bee.next = function (val) {
        bee.halt = ~bee.ignore.indexOf(val);

        if (!bee.halt) {
          bee.ignore.push(val);
        }

        return val;
      };

      this.attached.push(bee);

      return bee;
    };

    return WMBee;
  })();

  module.exports = WMBee;
});