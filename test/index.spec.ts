// Copyright (C) myl7
// SPDX-License-Identifier: Apache-2.0

import { selectAll, selectOne } from 'css-select'
import { parseDocument } from 'htmlparser2'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { describe, expect, it } from 'vitest'
import plugin from '../src/index.js'

function defineCase(
  name: string,
  options: {
    input: string
    assertions: (html: string) => Promise<void> | void
  }
) {
  it(name, async function () {
    const processor = remark()
      .use(remarkParse)
      // To make unified happy, since it does not allow (for types) to pass an undefined as config.
      // This test code can also handle the difference between `.use(plugin)` and `.use(plugin, {})`.
      .use(plugin)
      .use(remarkRehype)
      .use(rehypeStringify)

    const html = String(await processor.process(options.input))
    await options.assertions(html)

    expect(html).toMatchSnapshot()
  })
}

describe('GitHub beta blockquote-based admonitions with titles like [!NOTE]', function () {
  defineCase('should transform', {
    input: `\
# Admonitions
> [!NOTE]
> test
`,
    assertions(html) {
      const elem = selectOne(
        'div.gfm-alert > p.gfm-alert-title:first-child',
        parseDocument(html)
      )
      expect(elem).to.have.nested.property('firstChild.data', 'Note')
    }
  })

  defineCase('should not transform when single line', {
    input: `\
# Admonitions
> [!NOTE] test
`,
    assertions(html) {
      const elem = selectOne('div.gfm-alert', parseDocument(html))
      expect(elem).to.have.be.null
    }
  })

  defineCase('should transform with nested ones', {
    input: `\
# Admonitions
> [!NOTE]
> test
>
> > [!NOTE]
> > test
> >
> > > [!WARNING]
> > > test
`,
    assertions(html) {
      const elem = selectOne(
        'div.gfm-alert > div.gfm-alert > div.gfm-alert > p.gfm-alert-title:first-child',
        parseDocument(html)
      )
      expect(elem).to.have.nested.property('firstChild.data', 'Warning')
    }
  })

  defineCase('should transform with unordered lists from issue #4', {
    input: `\
# Admonitions
> [!NOTE]
> - Here you go
> - Here you go again
> - Here you go one more time
`,
    assertions(html) {
      const elem = selectOne(
        'div.gfm-alert > p.gfm-alert-title:first-child',
        parseDocument(html)
      )
      expect(elem).to.have.nested.property('firstChild.data', 'Note')
    }
  })

  defineCase('should transform with ordered lists from issue #4', {
    input: `\
# Admonitions
> [!NOTE]
> 1. Here you go
> 2. Here you go again
> 3. Here you go one more time
`,
    assertions(html) {
      const elem = selectOne(
        'div.gfm-alert > p.gfm-alert-title:first-child',
        parseDocument(html)
      )
      expect(elem).to.have.nested.property('firstChild.data', 'Note')
    }
  })

  defineCase(
    'should not transform when title is not in form [!NOTE] but legacy **Note**',
    {
      input: `\
# Admonitions
> **Note**
> test
`,
      assertions(html) {
        const elem = selectOne('div.gfm-alert', parseDocument(html))
        expect(elem).to.be.null
      }
    }
  )

  defineCase(
    'should transform with title with trailing whitespaces to be trimmed',
    {
      input: `\
# Admonitions
> [!NOTE] \r\t\v\

> test
`,
      assertions(html) {
        const elem = selectOne(
          'div.gfm-alert > p.gfm-alert-title:first-child',
          parseDocument(html)
        )
        expect(elem).to.have.nested.property('firstChild.data', 'Note')
      }
    }
  )

  defineCase(
    'should transform GitHub example (until 2024-01-02) with default config',
    {
      input: `\
# Admonitions
> [!NOTE]
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Crucial information necessary for users to succeed.

> [!WARNING]
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.
`,
      assertions(html) {
        const elems = selectAll(
          'div.gfm-alert > p.gfm-alert-title:first-child',
          parseDocument(html)
        )
        expect(elems).to.have.lengthOf(5)
        expect(elems[0]).to.have.nested.property('firstChild.data', 'Note')
        expect(elems[1]).to.have.nested.property('firstChild.data', 'Tip')
        expect(elems[2]).to.have.nested.property('firstChild.data', 'Important')
        expect(elems[3]).to.have.nested.property('firstChild.data', 'Warning')
        expect(elems[4]).to.have.nested.property('firstChild.data', 'Caution')
      }
    }
  )

  defineCase(
    'should transform when title has 2 trailing spaces from issue #12',
    {
      input:
        '# Admonitions\n' +
        // So that the title isn't put inline with the forecoming text,
        // when no GFM admonitions are available.
        // These 2 spaces with the newline are transformed into an inline break.
        // ----------vv
        '> [!WARNING]  \n' +
        '> Critical content demanding immediate user attention due to potential risks.\n',
      assertions(html) {
        const elem = selectOne(
          'div.gfm-alert > p.gfm-alert-title:first-child',
          parseDocument(html)
        )
        expect(elem).to.have.nested.property('firstChild.data', 'Warning')
      }
    }
  )
})
