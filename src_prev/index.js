// @flow

import { type Options } from "./options";
import {
  hasPlugin,
  validatePlugins,
  mixinPluginNames,
  mixinPlugins
} from "./plugin-utils";
import Parser from "./parser";
import { getParser as lscGetParser, Plugin, PluginManager, PluginList } from './plugins/core'

import { types as tokTypes } from "./tokenizer/types";
import "./tokenizer/context";

import type { Expression, File } from "./types";

export function parse(input: string, options?: Options): File {
  if (options && options.sourceType === "unambiguous") {
    options = {
      ...options,
    };
    try {
      options.sourceType = "module";
      const parser = lscGetParser(options, input);
      const ast = parser.parse();

      // Rather than try to parse as a script first, we opt to parse as a module and convert back
      // to a script where possible to avoid having to do a full re-parse of the input content.
      if (!parser.sawUnambiguousESM) ast.program.sourceType = "script";
      return ast;
    } catch (moduleError) {
      try {
        options.sourceType = "script";
        return lscGetParser(options, input).parse();
      } catch (scriptError) {}

      throw moduleError;
    }
  } else {
    return lscGetParser(options, input).parse();
  }
}

export function parseExpression(input: string, options?: Options): Expression {
  const parser = lscGetParser(options, input);
  if (parser.options.strictMode) {
    parser.state.strict = true;
  }
  return parser.getExpression();
}

export { tokTypes };
export { Plugin, PluginManager, PluginList };
