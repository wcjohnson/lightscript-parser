'use strict';

var _TestRunner = require('./TestRunner');

var _TestFilter = require('./TestFilter');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lib = require('../../lib');

var _misMatch = require('./misMatch');

var _misMatch2 = _interopRequireDefault(_misMatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ParserTestable = class ParserTestable extends _TestRunner.Testable {
  loadTest() {
    this.loadTestData();
    this.enqueueTest();
  }readTestOptions() {
    const options = this.readLocalArtifact("options.json", false);
    if (options) return JSON.parse(options);
  }loadTestData() {
    if (this.name && this.name[0] === '.') {
      this.disabled = true;
      return;
    }const options = this.readTestOptions();
    if (options) Object.assign(this.options, options);
    //console.log("Test options:", this.title, this.options)

    this.actual = this.readLocalArtifact("input", true);
    this.expected = this.readLocalArtifact("output.json", false);
  }enqueueTest() {
    if (this.actual) {
      // Get `it` from Jest global
      const testFn = typeof it !== 'undefined' ? this.disabled ? it == null ? void 0 : it.skip : it : void 0;
      if (testFn) testFn(this.title, () => this.runTest());
    }
  }throwAnnotatedError(err) {
    err.message = this.title + ": " + err.message;
    throw err;
  }runTest() {
    if (this.options.throws && this.expected) {
      this.throwAnnotatedError(new Error("File expected.json exists although options specify throws."));
    }let ast;
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
          err.message = `Expected error message: ${opts.throws}. Got error message: ${err.message}`;
          this.throwAnnotatedError(err);
        }
      } else if (!this.expected && process.env.SAVE_THROWS) {
        this.saveThrows(err);
      }this.throwAnnotatedError(err);
    }

    // Don't store comments in expected output
    if (ast.comments && !ast.comments.length) delete ast.comments;

    if (!this.expected && !this.options.throws && process.env.SAVE_EXPECTED) {
      this.saveExpected(ast);
    }if (this.options.throws) {
      this.throwAnnotatedError(new Error("Expected error message: " + this.options.throws + ". But parsing succeeded."));
    } else {
      const mis = (0, _misMatch2.default)(JSON.parse(this.expected), ast);
      if (mis) this.throwAnnotatedError(new Error("Mismatch against expected output: " + mis));
    }
  }saveExpected(ast) {
    const toJSON = RegExp.prototype.toJSON;
    RegExp.prototype.toJSON = RegExp.prototype.toString;
    const jsonAst = JSON.stringify(ast, null, "  ");
    RegExp.prototype.toJSON = toJSON;

    this.saveLocalArtifact("expected.json", jsonAst);
  }saveThrows(err) {
    const opts = this.readTestOptions() || {};
    opts.throws = err.message;
    this.saveLocalArtifact("options.json", JSON.stringify(opts, null, "  "));
  }
}; // Test the test runner

const run = new _TestRunner.TestRun();
run.parse = _lib.parse;
run.getTestableConstructor = function getTestableConstructor() {
  return ParserTestable;
};run.extensions = ['.js', '.lsc', '.lsx'];
const opts = new _TestRunner.TestOptions();

const filter = new _TestFilter.TestFilter();
if (process.env.ONLY) {
  filter.only(process.env.ONLY);
}const rootTestable = new _TestRunner.Testable(run, null, filter);
rootTestable.setTestPath(_path2.default.join(__dirname, '../fixtures'));
rootTestable.readTestDirectory();