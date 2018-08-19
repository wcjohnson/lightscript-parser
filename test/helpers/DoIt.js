'use strict';

var _TestRunner = require('./TestRunner');

var _TestFilter = require('./TestFilter');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lib = require('../../lib');

var _misMatch = require('./misMatch');

var _misMatch2 = _interopRequireDefault(_misMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ParserTestOptions = class ParserTestOptions extends _TestRunner.TestOptions {
  inherits(other) {
    if (!other) return;
    for (let _i = 0, _keys = Object.keys(other), _len = _keys.length; _i < _len; _i++) {
      const k = _keys[_i];const v = other[k];
      if (k === 'throws') {
        null;
      } else {
        this[k] = v;
      }
    }
  }assign(other) {
    if (!other) return;
    for (let _i2 = 0, _keys2 = Object.keys(other), _len2 = _keys2.length; _i2 < _len2; _i2++) {
      const k = _keys2[_i2];const v = other[k];
      if (k === 'includePlugins') {
        this[k] = (this[k] || []).concat(v);
      } else {
        this[k] = v;
      }
    }
  }
};
let ParserTestable = class ParserTestable extends _TestRunner.Testable {
  loadTest() {
    this.loadTestData();
    this.enqueueTest();
  }readTestOptions() {
    const optionsData = this.readLocalArtifact("options.json", false);
    const options = optionsData ? JSON.parse(optionsData) : {};
    // Allow test options to be overridden
    const overrideData = this.readLocalArtifact("options.override.json", false);
    if (overrideData) {
      Object.assign(options, JSON.parse(overrideData));
    }return options;
  }loadTestData() {
    if (this.name && this.name[0] === '.') {
      this.disabled = true;
      return;
    }const options = this.readTestOptions();
    if (options) this.options.assign(options);
    //console.log("Test options:", this.title, this.options)

    this.actual = this.readLocalArtifact("input", true);
    this.expected = this.readLocalArtifact("output", ['.override.json', '.json']);

    // Use parent input if no child input.
    if (!this.actual && this.parent && this.parent.actual) {
      if (!this.expected) this.expected = this.parent.expected;
      this.actual = this.parent.actual;
    }
  }enqueueTest() {
    if (this.actual) {
      // Get `it` from Jest global
      const testFn = typeof it !== 'undefined' ? this.disabled ? it == null ? void 0 : it.skip : it : void 0;
      if (testFn) {
        testFn(this.title, () => this.runTest());
      } else {
        console.log("enqueuing", this.title);
      }
    } else {
      // console.log("skipping (no input)", this.title)
      return;
    }
  }throwAnnotatedError(err) {
    err.message = this.title + ": " + err.message;
    throw err;
  }runTest() {
    let ast;
    try {
      ast = this.run.parse(this.actual, this.options);
    } catch (err) {
      if (this.options.throws) {
        if (err.message === this.options.throws) {
          return;
        } else if (process.env.SAVE_THROWS) {
          this.saveThrows(err);
          this.throwAnnotatedError(err);
        } else {
          err.message = `Expected error message: ${this.options.throws}. Got error message: ${err.message}`;
          this.throwAnnotatedError(err);
        }
      } else if (!this.expected && process.env.SAVE_THROWS) {
        this.saveThrows(err);
      }this.throwAnnotatedError(err);
    }

    if (this.options.throws) {
      this.throwAnnotatedError(new Error(`Expected error message '${this.options.throws}' but no error was thrown.`));
    } // Don't store comments in expected output
    if (ast.comments && !ast.comments.length) delete ast.comments;

    if (!this.expected && !this.options.throws && process.env.SAVE_EXPECTED) {
      this.saveExpected(ast, "output.json");
      return;
    }if (this.options.throws) {
      this.throwAnnotatedError(new Error("Expected error message: " + this.options.throws + ". But parsing succeeded."));
    } else {
      if (this.expected) {
        const mis = (0, _misMatch2.default)(JSON.parse(this.expected), ast);
        if (mis) {
          if (process.env.SAVE_OVERRIDE) {
            this.saveExpected(ast, "output.override.json");
          } else {
            this.throwAnnotatedError(new Error("Mismatch against expected output: " + mis));
          }
        }
      } else {
        this.throwAnnotatedError(new Error("Empty expected output -- use SAVE_EXPECTED=1 to create expected output."));
      }
    }
  }saveExpected(ast, filename) {
    const toJSON = RegExp.prototype.toJSON;
    RegExp.prototype.toJSON = RegExp.prototype.toString;
    const jsonAst = JSON.stringify(ast, null, "  ");
    RegExp.prototype.toJSON = toJSON;

    this.saveLocalArtifact(filename, jsonAst);
  }saveThrows(err) {
    const opts = this.readTestOptions() || {};
    opts.throws = err.message;
    this.saveLocalArtifact("options.json", JSON.stringify(opts, null, "  "));
  }
};
const run = new _TestRunner.TestRun();
run.parse = _lib.parse;
run.getTestableConstructor = function getTestableConstructor() {
  return ParserTestable;
};run.getOptionsConstructor = function getOptionsConstructor() {
  return ParserTestOptions;
};run.extensions = ['.js', '.lsc', '.lsx'];

const filter = new _TestFilter.TestFilter();
if (process.env.ONLY) {
  filter.only(process.env.ONLY);
}const rootTestable = new ParserTestable(run, null, filter);
rootTestable.setTestPath(_path2.default.join(__dirname, '../fixtures'));
rootTestable.readTestDirectory();