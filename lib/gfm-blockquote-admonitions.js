'use strict';

var inkdrop = require('inkdrop');

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */


/**
 * Generate an assertion from a test.
 *
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes a compatible test.
 *
 * The created function is a bit faster because it expects valid input only:
 * a `node`, `index`, and `parent`.
 *
 * @param test
 *   *   when nullish, checks if `node` is a `Node`.
 *   *   when `string`, works like passing `(node) => node.type === test`.
 *   *   when `function` checks if function passed the node is true.
 *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   when `array`, checks if any one of the subtests pass.
 * @returns
 *   An assertion.
 */
const convert =
/**
 * @type {(
 *   (<Kind extends Node>(test: PredicateTest<Kind>) => AssertPredicate<Kind>) &
 *   ((test?: Test) => AssertAnything)
 * )}
 */

/**
 * @param {Test} [test]
 * @returns {AssertAnything}
 */
function (test) {
  if (test === undefined || test === null) {
    return ok;
  }
  if (typeof test === 'string') {
    return typeFactory(test);
  }
  if (typeof test === 'object') {
    return Array.isArray(test) ? anyFactory(test) : propsFactory(test);
  }
  if (typeof test === 'function') {
    return castFactory(test);
  }
  throw new Error('Expected function, string, or object as test');
};

/**
 * @param {Array<string | Props | TestFunctionAnything>} tests
 * @returns {AssertAnything}
 */
function anyFactory(tests) {
  /** @type {Array<AssertAnything>} */
  const checks = [];
  let index = -1;
  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }
  return castFactory(any);

  /**
   * @this {unknown}
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function any(...parameters) {
    let index = -1;
    while (++index < checks.length) {
      if (checks[index].call(this, ...parameters)) return true;
    }
    return false;
  }
}

/**
 * Turn an object into a test for a node with a certain fields.
 *
 * @param {Props} check
 * @returns {AssertAnything}
 */
function propsFactory(check) {
  return castFactory(all);

  /**
   * @param {Node} node
   * @returns {boolean}
   */
  function all(node) {
    /** @type {string} */
    let key;
    for (key in check) {
      // @ts-expect-error: hush, it sure works as an index.
      if (node[key] !== check[key]) return false;
    }
    return true;
  }
}

/**
 * Turn a string into a test for a node with a certain type.
 *
 * @param {string} check
 * @returns {AssertAnything}
 */
function typeFactory(check) {
  return castFactory(type);

  /**
   * @param {Node} node
   */
  function type(node) {
    return node && node.type === check;
  }
}

/**
 * Turn a custom test into a test for a node that passes that test.
 *
 * @param {TestFunctionAnything} check
 * @returns {AssertAnything}
 */
function castFactory(check) {
  return assertion;

  /**
   * @this {unknown}
   * @param {unknown} node
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function assertion(node, ...parameters) {
    return Boolean(node && typeof node === 'object' && 'type' in node &&
    // @ts-expect-error: fine.
    Boolean(check.call(this, node, ...parameters)));
  }
}
function ok() {
  return true;
}

/**
 * @param {string} d
 * @returns {string}
 */
function color(d) {
  return '\u001B[33m' + d + '\u001B[39m';
}

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist-util-is').Test} Test
 */


/**
 * Continue traversing as normal.
 */
const CONTINUE = true;

/**
 * Stop traversing immediately.
 */
const EXIT = false;

/**
 * Do not traverse this node’s children.
 */
const SKIP = 'skip';

/**
 * Visit nodes, with ancestral information.
 *
 * This algorithm performs *depth-first* *tree traversal* in *preorder*
 * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
 *
 * You can choose for which nodes `visitor` is called by passing a `test`.
 * For complex tests, you should test yourself in `visitor`, as it will be
 * faster and will have improved type information.
 *
 * Walking the tree is an intensive task.
 * Make use of the return values of the visitor when possible.
 * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
 * to check if a node matches, and then perform different operations.
 *
 * You can change the tree.
 * See `Visitor` for more info.
 *
 * @param tree
 *   Tree to traverse.
 * @param test
 *   `unist-util-is`-compatible test
 * @param visitor
 *   Handle each node.
 * @param reverse
 *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
 * @returns
 *   Nothing.
 */
const visitParents =
/**
 * @type {(
 *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
 *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
 * )}
 */

/**
 * @param {Node} tree
 * @param {Test} test
 * @param {Visitor<Node>} visitor
 * @param {boolean | null | undefined} [reverse]
 * @returns {void}
 */
function (tree, test, visitor, reverse) {
  if (typeof test === 'function' && typeof visitor !== 'function') {
    reverse = visitor;
    // @ts-expect-error no visitor given, so `visitor` is test.
    visitor = test;
    test = null;
  }
  const is = convert(test);
  const step = reverse ? -1 : 1;
  factory(tree, undefined, [])();

  /**
   * @param {Node} node
   * @param {number | undefined} index
   * @param {Array<Parent>} parents
   */
  function factory(node, index, parents) {
    /** @type {Record<string, unknown>} */
    // @ts-expect-error: hush
    const value = node && typeof node === 'object' ? node : {};
    if (typeof value.type === 'string') {
      const name =
      // `hast`
      typeof value.tagName === 'string' ? value.tagName :
      // `xast`
      typeof value.name === 'string' ? value.name : undefined;
      Object.defineProperty(visit, 'name', {
        value: 'node (' + color(node.type + (name ? '<' + name + '>' : '')) + ')'
      });
    }
    return visit;
    function visit() {
      /** @type {ActionTuple} */
      let result = [];
      /** @type {ActionTuple} */
      let subresult;
      /** @type {number} */
      let offset;
      /** @type {Array<Parent>} */
      let grandparents;
      if (!test || is(node, index, parents[parents.length - 1] || null)) {
        result = toResult(visitor(node, parents));
        if (result[0] === EXIT) {
          return result;
        }
      }

      // @ts-expect-error looks like a parent.
      if (node.children && result[0] !== SKIP) {
        // @ts-expect-error looks like a parent.
        offset = (reverse ? node.children.length : -1) + step;
        // @ts-expect-error looks like a parent.
        grandparents = parents.concat(node);

        // @ts-expect-error looks like a parent.
        while (offset > -1 && offset < node.children.length) {
          // @ts-expect-error looks like a parent.
          subresult = factory(node.children[offset], offset, grandparents)();
          if (subresult[0] === EXIT) {
            return subresult;
          }
          offset = typeof subresult[1] === 'number' ? subresult[1] : offset + step;
        }
      }
      return result;
    }
  }
};

/**
 * Turn a return value into a clean result.
 *
 * @param {VisitorResult} value
 *   Valid return values from visitors.
 * @returns {ActionTuple}
 *   Clean result.
 */
function toResult(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'number') {
    return [CONTINUE, value];
  }
  return [value];
}

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist-util-is').Test} Test
 * @typedef {import('unist-util-visit-parents').VisitorResult} VisitorResult
 */


/**
 * Visit nodes.
 *
 * This algorithm performs *depth-first* *tree traversal* in *preorder*
 * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
 *
 * You can choose for which nodes `visitor` is called by passing a `test`.
 * For complex tests, you should test yourself in `visitor`, as it will be
 * faster and will have improved type information.
 *
 * Walking the tree is an intensive task.
 * Make use of the return values of the visitor when possible.
 * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
 * to check if a node matches, and then perform different operations.
 *
 * You can change the tree.
 * See `Visitor` for more info.
 *
 * @param tree
 *   Tree to traverse.
 * @param test
 *   `unist-util-is`-compatible test
 * @param visitor
 *   Handle each node.
 * @param reverse
 *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
 * @returns
 *   Nothing.
 */
const visit =
/**
 * @type {(
 *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
 *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
 * )}
 */

/**
 * @param {Node} tree
 * @param {Test} test
 * @param {Visitor} visitor
 * @param {boolean | null | undefined} [reverse]
 * @returns {void}
 */
function (tree, test, visitor, reverse) {
  if (typeof test === 'function' && typeof visitor !== 'function') {
    reverse = visitor;
    visitor = test;
    test = null;
  }
  visitParents(tree, test, overload, reverse);

  /**
   * @param {Node} node
   * @param {Array<Parent>} parents
   */
  function overload(node, parents) {
    const parent = parents[parents.length - 1];
    return visitor(node, parent ? parent.children.indexOf(node) : null, parent);
  }
};

const defaultConfig = {
    blockCssClass: 'markdown-alert',
    titleCssClass: 'markdown-alert-title',
    types: {
        '[!NOTE]': {
            // MIT License - Copyright (c) 2023 GitHub Inc. <https://github.com/primer/octicons>
            svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
            title: 'Note',
            cssClass: 'markdown-alert-type-note'
        },
        '[!IMPORTANT]': {
            // MIT License - Copyright (c) 2023 GitHub Inc. <https://github.com/primer/octicons>
            svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
            title: 'Important',
            cssClass: 'markdown-alert-type-important'
        },
        '[!WARNING]': {
            // MIT License - Copyright (c) 2023 GitHub Inc. <https://github.com/primer/octicons>
            svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"/></svg>',
            title: 'Warning',
            cssClass: 'markdown-alert-type-warning'
        }
    }
};

// Copyright (C) myl7
// SPDX-License-Identifier: Apache-2.0
// https://github.com/myl7/remark-github-beta-blockquote-admonitions/blob/c1833a503f4766cb4e1342bdf91322b7bc023412/src/index.ts
// Changes made:
// - Replaced the config with a new one that is compatible with this plugin.
// - Admonitions cannot be nested.
// - Added a icon to the title.
const remarkGfmBlockquoteAdmonitionsPlugin = () => {
    return (tree) => {
        visit(tree, processNode(defaultConfig));
    };
};
const processNode = (config) => {
    return (node, _index, parent) => {
        if (node.type != 'blockquote') {
            return;
        }
        if (parent && parent.type == 'blockquote') {
            return;
        }
        const blockquote = node;
        if (blockquote.children[0]?.type != 'paragraph') {
            return;
        }
        const paragraph = blockquote.children[0];
        if (paragraph.children[0]?.type != 'text') {
            return;
        }
        const text = paragraph.children[0];
        const titleEnd = text.value.indexOf('\n');
        if (titleEnd < 0) {
            return;
        }
        const textBody = text.value.substring(titleEnd + 1);
        let title = text.value.substring(0, titleEnd);
        // https://github.github.com/gfm/#whitespace-character
        const whitespaceCharacter = /[ \t\v\f\r]+$/.exec(title);
        if (whitespaceCharacter) {
            title = title.substring(0, title.length - whitespaceCharacter[0].length);
        }
        const admonitionType = config.types[title];
        if (!admonitionType) {
            return;
        }
        text.value = textBody;
        const paragraphTitleText = {
            value: admonitionType.title,
            type: 'text'
        };
        const paragraphIcon = {
            type: 'html',
            value: `<span class='icon'>${admonitionType.svgIcon}</span>`
        };
        const paragraphTitle = {
            type: 'paragraph',
            children: [paragraphIcon, paragraphTitleText],
            data: { hProperties: { className: config.titleCssClass } }
        };
        blockquote.children.unshift(paragraphTitle);
        blockquote.data = {
            ...blockquote.data,
            hProperties: { className: `${config.blockCssClass} ${admonitionType.cssClass}` },
            hName: 'div'
        };
    };
};

class GfmBlockquoteAdmonitions {
    activate = async () => {
        if (inkdrop.markdownRenderer) {
            inkdrop.markdownRenderer.remarkPlugins.push(remarkGfmBlockquoteAdmonitionsPlugin);
        }
    };
    deactivate = async () => {
        if (inkdrop.markdownRenderer) {
            inkdrop.markdownRenderer.remarkPlugins = inkdrop.markdownRenderer.remarkPlugins.filter((plugin) => remarkGfmBlockquoteAdmonitionsPlugin !== plugin);
        }
    };
}
const plugin = new GfmBlockquoteAdmonitions();
module.exports = {
    config: {},
    activate() {
        plugin.activate();
    },
    deactivate() {
        plugin.deactivate();
    }
};
//# sourceMappingURL=gfm-blockquote-admonitions.js.map
