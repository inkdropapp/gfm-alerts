// Copyright (C) myl7
// SPDX-License-Identifier: Apache-2.0
// https://github.com/myl7/remark-github-beta-blockquote-admonitions/blob/c1833a503f4766cb4e1342bdf91322b7bc023412/src/index.ts
// Changes made:
// - Replaced the config with a new one that is compatible with this plugin.
// - Admonitions cannot be nested.
// - Added a icon to the title.

import type { Blockquote, Html, Paragraph, Text } from 'mdast';
import type { Plugin } from 'unified';
import type { BuildVisitor } from 'unist-util-visit';
import { visit } from 'unist-util-visit';

import { Config, defaultConfig } from '../config';

const remarkGfmBlockquoteAdmonitionsPlugin: Plugin = () => {
    return (tree: any) => {
        visit(tree, processNode(defaultConfig));
    };
};

export default remarkGfmBlockquoteAdmonitionsPlugin;

const processNode = (config: Config): BuildVisitor => {
    return (node, _index, parent: import('unist').Node | undefined) => {
        if (node.type != 'blockquote') {
            return;
        }
        if (parent && parent.type == 'blockquote') {
            return;
        }

        const blockquote = node as Blockquote;
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

        const paragraphTitleText: Text = {
            value: admonitionType.title,
            type: 'text'
        };
        const paragraphIcon: Html = {
            type: 'html',
            value: `<span class='icon'>${admonitionType.svgIcon}</span>`
        };

        const paragraphTitle: Paragraph = {
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
