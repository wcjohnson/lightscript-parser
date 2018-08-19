// This plugin provides additional extension points for Parser class mixins
// by subdividing some of the core methods along the recursive descent chain.

import { Plugin } from './core/plugin'
import { types as tt } from "../tokenizer/types"

const additionalExtensionPoints = new Plugin({
  name: 'additionalExtensionPoints',
  loadOrderPriority: -1000000, // Must load first

  mixin(ParserBase, opts) {
    return class extends ParserBase {
      parseSequenceExpression(expr, startPos, startLoc, noIn, refShorthandDefaultPos) {
        const node = this.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this.eat(tt.comma)) {
          node.expressions.push(
            this.parseMaybeAssign(noIn, refShorthandDefaultPos),
          );
        }
        this.toReferencedList(node.expressions);
        return this.finishNode(node, "SequenceExpression");
      }

      parseExpression(noIn?: boolean, refShorthandDefaultPos) {
        const startPos = this.state.start;
        const startLoc = this.state.startLoc;
        const expr = this.parseMaybeAssign(noIn, refShorthandDefaultPos);
        if (this.match(tt.comma)) {
          return this.parseSequenceExpression(expr, startPos, startLoc, noIn, refShorthandDefaultPos);
        }
        return expr;
      }

      parseBinaryOperator(node): void {
        node.operator = this.state.value
      }

      getBinopNodeType(tokenType, operator) {
        return (tokenType === tt.logicalOR ||
          tokenType === tt.logicalAND ||
          tokenType === tt.nullishCoalescing
            ? "LogicalExpression"
            : "BinaryExpression");
      }

      parseExprOp(left, leftStartPos, leftStartLoc, minPrec, noIn) {
        const prec = this.state.type.binop;
        if (prec != null && (!noIn || !this.match(tt._in))) {
          if (prec > minPrec) {
            const node = this.startNodeAt(leftStartPos, leftStartLoc);
            node.left = left;
            this.parseBinaryOperator(node);
            const operator = node.operator;

            if (
              operator === "**" &&
              left.type === "UnaryExpression" &&
              !(left.extra && left.extra.parenthesized)
            ) {
              this.raise(
                left.argument.start,
                "Illegal expression. Wrap left hand side or entire exponentiation in parentheses.",
              );
            }

            const op = this.state.type;
            if (op === tt.nullishCoalescing) {
              this.expectPlugin("nullishCoalescingOperator");
            } else if (op === tt.pipeline) {
              this.expectPlugin("pipelineOperator");
            }

            this.next();

            const startPos = this.state.start;
            const startLoc = this.state.startLoc;

            if (op === tt.pipeline) {
              if (
                this.match(tt.name) &&
                this.state.value === "await" &&
                this.state.inAsync
              ) {
                throw this.raise(
                  this.state.start,
                  `Unexpected "await" after pipeline body; await must have parentheses in minimal proposal`,
                );
              }
            }

            node.right = this.parseExprOp(
              this.parseMaybeUnary(),
              startPos,
              startLoc,
              op.rightAssociative ? prec - 1 : prec,
              noIn,
            );

            this.finishNode(node, this.getBinopNodeType(op, operator));
            return this.parseExprOp(
              node,
              leftStartPos,
              leftStartLoc,
              minPrec,
              noIn,
            );
          }
        }
        return left;
      }

      parseUnaryOperator(node, isPrefix): void {
        node.operator = this.state.value;
      }

      parseUnaryPrefix(refShorthandDefaultPos) {
        const node = this.startNode();
        const update = this.match(tt.incDec);
        this.parseUnaryOperator(node, true);
        node.prefix = true;

        if (node.operator === "throw") {
          this.expectPlugin("throwExpressions");
        }
        this.next();

        node.argument = this.parseMaybeUnary();

        if (refShorthandDefaultPos && refShorthandDefaultPos.start) {
          this.unexpected(refShorthandDefaultPos.start);
        }

        if (update) {
          this.checkLVal(node.argument, undefined, undefined, "prefix operation");
        } else if (this.state.strict && node.operator === "delete") {
          const arg = node.argument;

          if (arg.type === "Identifier") {
            this.raise(node.start, "Deleting local variable in strict mode");
          } else if (
            arg.type === "MemberExpression" &&
            arg.property.type === "PrivateName"
          ) {
            this.raise(node.start, "Deleting a private field is not allowed");
          }
        }

        return this.finishNode(
          node,
          update ? "UpdateExpression" : "UnaryExpression",
        );
      }

      parseUnaryPostfix(startPos, startLoc, expr) {
        const node = this.startNodeAt(startPos, startLoc);
        this.parseUnaryOperator(node, false);
        node.prefix = false;
        node.argument = expr;
        this.checkLVal(expr, undefined, undefined, "postfix operation");
        this.next();
        return this.finishNode(node, "UpdateExpression");
      }

      parseMaybeUnary(refShorthandDefaultPos) {
        if (this.state.type.prefix) {
          return this.parseUnaryPrefix(refShorthandDefaultPos);
        }

        const startPos = this.state.start;
        const startLoc = this.state.startLoc;
        let expr = this.parseExprSubscripts(refShorthandDefaultPos);
        if (refShorthandDefaultPos && refShorthandDefaultPos.start) return expr;
        while (this.state.type.postfix && !this.canInsertSemicolon()) {
          expr = this.parseUnaryPostfix(startPos, startLoc, expr);
        }
        return expr;
      }
    }
  }
})

export default additionalExtensionPoints;
