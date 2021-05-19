"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Testable = exports.TestRun = exports.TestOptions = undefined;

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _trimEnd = require("lodash/trimEnd");

var _trimEnd2 = _interopRequireDefault(_trimEnd);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let TestOptions = exports.TestOptions = class TestOptions {
  constructor(parentOptions) {
    this.inherits(parentOptions);
  }inherits(parentOptions) {
    Object.assign(this, parentOptions);
  }assign(childOptions) {
    Object.assign(this, childOptions);
  }
};
let TestRun = exports.TestRun = class TestRun {
  getTestableConstructor(thisTestable) {
    return Object.getPrototypeOf(thisTestable).constructor;
  }getOptionsConstructor(thisTestable) {
    var _thisTestable$parent;

    if (thisTestable.options) {
      return Object.getPrototypeOf(thisTestable.options).constructor;
    } else if ((_thisTestable$parent = thisTestable.parent) == null ? void 0 : _thisTestable$parent.options) {
      return Object.getPrototypeOf(thisTestable.parent.options).constructor;
    } else {
      return TestOptions;
    }
  }
};
let Testable = exports.Testable = class Testable {
  constructor(run, parent, filter, options) {
    var _parent;

    this.run = run;
    this.parent = parent;
    this.filter = filter || allTests;
    this.options = options || new (run.getOptionsConstructor(this))((_parent = this.parent) == null ? void 0 : _parent.options);
    this.subtests = [];
    this.name = '';
    this.title = '';
  }setRelativeTestPath(subdir) {
    var _parent2, _parent3;

    this.name = subdir;
    this.title = ((_parent2 = this.parent) == null ? void 0 : _parent2.title) ? `${this.parent.title}/${subdir}` : subdir;
    return this.path = _path2.default.join(((_parent3 = this.parent) == null ? void 0 : _parent3.path) || '', subdir);
  }setTestPath(path) {
    return this.path = path;
  }readTestDirectory() {
    const testFiles = _fs2.default.readdirSync(this.path);
    const localTestFiles = [];
    const subTestDirectories = [];
    for (let _i = 0, _len = testFiles.length; _i < _len; _i++) {
      const d = testFiles[_i];
      const fullName = _path2.default.join(this.path, d);
      // Subdirectories represent subtests
      if (_fs2.default.statSync(fullName).isDirectory()) {
        subTestDirectories.push(d);
      } else {
        localTestFiles.push(d);
      }
    }this.localTestFiles = localTestFiles;
    this.loadTest();

    for (let _i2 = 0, _len2 = subTestDirectories.length; _i2 < _len2; _i2++) {
      const d = subTestDirectories[_i2];
      this.addSubTestableFromRelativePath(d);
    }
  }addSubTestableFromRelativePath(relativePath) {
    const subTestable = new (this.run.getTestableConstructor(this))(this.run, this, this.filter);
    subTestable.setRelativeTestPath(relativePath);
    // console.log("filtering", subTestable.title, "against", this.filter)
    if (this.filter.filter(subTestable.title)) {
      // console.log("PASSED filter")
      subTestable.readTestDirectory();
      this.addSubTest(subTestable);
    }
  }addSubTest(subTest) {
    this.subtests.push(subTest);
  }loadTest() {
    return;
  }saveLocalArtifact(fileName, data) {
    _fs2.default.writeFileSync(_path2.default.join(this.path, fileName), data);
  }resolveLocalArtifact(baseName, extensions) {
    if (!Array.isArray(extensions)) {
      extensions = extensions ? this.run.extensions || [''] : [''];
    }const matches = (() => {
      const _arr = [];for (let _i3 = 0, _len3 = extensions.length; _i3 < _len3; _i3++) {
        const ext = extensions[_i3];
        const resolvedName = baseName + ext;
        if (this.localTestFiles.indexOf(resolvedName) > -1) _arr.push(resolvedName);
      }return _arr;
    })();
    if (matches.length === 0) return null;

    return { fileName: matches[0], fullPath: _path2.default.join(this.path, matches[0]) };
  }readLocalArtifact(fileName, resolveExtension) {
    return this.readResolvedArtifact(this.resolveLocalArtifact(fileName, resolveExtension));
  }readResolvedArtifact(resolution) {
    if (!resolution) return '';
    const fullName = resolution.fullPath;

    if (_fs2.default.existsSync(fullName)) {
      let content = (0, _trimEnd2.default)(_fs2.default.readFileSync(fullName, "utf8"));
      content = content.replace(/\r\n/g, "\n");
      return content;
    } else {
      return '';
    }
  }
};