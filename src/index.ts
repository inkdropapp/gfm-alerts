// Copyright (C) myl7
// SPDX-License-Identifier: Apache-2.0
// https://github.com/myl7/remark-github-beta-blockquote-admonitions/blob/c1833a503f4766cb4e1342bdf91322b7bc023412/src/index.ts
// Changes made:
// - Replaced the config with a new one that is compatible with this plugin.
// - Admonitions cannot be nested.
// - Added a icon to the title.

import type { Blockquote, Html, Paragraph, Text } from 'mdast'
import type { Plugin } from 'unified'
import type { BuildVisitor } from 'unist-util-visit'
import { visit } from 'unist-util-visit'

import { AlertType, Config, defaultConfig } from './config.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const remarkGfmBlockquoteAdmonitionsPlugin: Plugin = () => (tree: any) => {
  visit(tree, processNode(defaultConfig))
}

export default remarkGfmBlockquoteAdmonitionsPlugin
export { defaultConfig }

const processNode =
  (config: Config): BuildVisitor =>
  (node, _index) => {
    if (node.type != 'blockquote') return

    const blockquote = node as Blockquote
    if (blockquote.children[0]?.type != 'paragraph') return
    const paragraph = blockquote.children[0]
    if (paragraph.children[0]?.type != 'text') return
    const text = paragraph.children[0]
    let title: string
    let admonitionType: AlertType | null = null
    // A link break after the title is explicitly required by GitHub
    const titleEnd = text.value.indexOf('\n')
    if (titleEnd < 0) {
      // But if the following one is a block, the newline would be trimmed by the upstream.
      // To start a new block, a newline is required.
      // So we just need to addtionally check if the following one is a block.
      // The legacy title variant is not affected since it checks an inline and does not care about the newline.

      // If this is not a gfm alert then we would manipulate the original children and the next processor would not be able to handle the children correctly.
      const paragraphChildrenCopy = [...paragraph.children]

      // No addtional inlines can exist in this paragraph for the title...
      if (paragraphChildrenCopy.length > 1) {
        // Unless it is an inline break, which can be transformed to from 2 spaces with a newline.
        if (paragraphChildrenCopy.at(1)?.type == 'break') {
          // When it is, we actually have already found the line break required by GitHub.
          // So we just strip the additional `<br>` element.
          // The title element will be removed later.
          paragraphChildrenCopy.splice(1, 1)
        } else {
          return
        }
      }

      // Considering the reason why the paragraph ends here, the following one should be a children of the blockquote, which means it is always a block.
      // So no more check is required.
      title = text.value
      admonitionType = config.types[title]

      if (admonitionType) {
        // Remove the text as the title
        paragraph.children.shift()
        paragraph.children.shift()
      } else {
        return
      }
    } else {
      const textBody = text.value.substring(titleEnd + 1)
      title = text.value.substring(0, titleEnd)
      // Handle whitespaces after the title.
      // Whitespace characters are defined by GFM.
      const m = /[ \t\v\f\r]+$/.exec(title)
      if (m) {
        title = title.substring(0, title.length - m[0].length)
      }

      admonitionType = config.types[title]
      if (!admonitionType) return
      // Update the text body to remove the title
      text.value = textBody
    }

    const paragraphTitleText: Text = {
      value: admonitionType.title,
      type: 'text'
    }
    const paragraphIcon: Html = {
      type: 'html',
      value: `<span class='icon'>${admonitionType.svgIcon}</span>`
    }

    const paragraphTitle: Paragraph = {
      type: 'paragraph',
      children: [paragraphIcon, paragraphTitleText],
      data: { hProperties: { className: config.titleCssClass } }
    }
    blockquote.children.unshift(paragraphTitle)

    blockquote.data = {
      ...blockquote.data,
      hProperties: {
        className: `${config.blockCssClass} ${admonitionType.cssClass}`
      },
      hName: 'div'
    }
  }
