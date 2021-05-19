"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
let TestFilter = exports.TestFilter = class TestFilter {
  constructor() {
    this.exclusions = null;
    this.inclusions = null;
    this.includePrefix = null;
  }exclude(name) {
    this.inclusions = null;
    this.exclusions = (this.exclusions || []).concat([name]);
  }only(name) {
    if (name) {
      this.exclusions = null;
      this.includePrefix = name;
      const paths = name.split("/");
      this.inclusions = (() => {
        const _arr = [];for (let i = 0, _len = paths.length; i < _len; i++) {
          _arr.push(paths.slice(0, i + 1).join('/'));
        }return _arr;
      })();
    }
  }filter(name) {
    if (this.exclusions) {
      for (let _arr2 = this.exclusions, _i = 0, _len2 = _arr2.length; _i < _len2; _i++) {
        const exclusion = _arr2[_i];
        if (name.indexOf(exclusion) > -1) return false;
      }return true;
    } else if (this.inclusions) {
      if (this.includePrefix && name.startsWith(this.includePrefix)) return true;
      for (let _arr3 = this.inclusions, _i2 = 0, _len3 = _arr3.length; _i2 < _len3; _i2++) {
        const inclusion = _arr3[_i2];
        if (name === inclusion) return true;
      }return false;
    }return true;
  }
};
const allTests = exports.allTests = new TestFilter();

const noTests = exports.noTests = new TestFilter();
noTests.filter = function filter(name) {
  return false;
};