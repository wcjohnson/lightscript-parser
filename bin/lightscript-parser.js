#!/usr/bin/env node
/* eslint no-var: 0 */

var parser = require("..");
var fs = require("fs");
var path = require("path");

var filename = process.argv[2];
if (!filename) {
  console.error("no filename specified");
  process.exit(0);
}
if (filename === "fixture") {
  filename = path.join("test", "fixtures", process.argv[3])
  if (fs.existsSync(path.join(filename, "input.js"))) {
    filename = path.join(filename, "input.js");
  } else {
    filename = path.join(filename, "input.lsc");
  }
}

var mgr = new parser.PluginManager();
mgr.addPlugins([
  "disableBitwiseOperators",
  "tildeCall",
  "significantWhitespace",
  "modifiedLogicalOperators",
  "seqExprRequiresParen",
  "lscCoreSyntax",
  "lscIf",
  "lscIfExpression",
  "lscTryExpression",
  "lscAssignment",
  "lscArrows",
  "lscForIn",
  "awaitArrow",
  "jsx",
  "flow",
]);

var file = fs.readFileSync(filename, "utf8");
var ast = parser.parse(file, {
  pluginManager: mgr,
  sourceType: "module"
});

console.log(JSON.stringify(ast, null, "  "));
