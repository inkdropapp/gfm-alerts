declare module 'inkdrop' {
    const markdownRenderer: Inkdrop.MarkdownRenderer;
}

declare namespace Inkdrop {
    /**
     * https://docs.inkdrop.app/reference/markdown-renderer
     */
    interface MarkdownRenderer {
        processor: unknown;
        remarkPlugins: Array<unkown>;
        rehypePlugins: Array<unkown>;
        remarkReactComponents: { [index: string]: typeof React.Component | undefined };
        remarkCodeComponents: { [index: string]: typeof React.Component | undefined };
        events: unknown;
    }
}
