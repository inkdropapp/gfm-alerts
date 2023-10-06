import { markdownRenderer } from 'inkdrop';
import remarkGfmBlockquoteAdmonitionsPlugin from './remark-gfm-blockquote-admonitions';

class GfmBlockquoteAdmonitions {
    activate = async () => {
        if (markdownRenderer) {
            markdownRenderer.remarkPlugins.push(remarkGfmBlockquoteAdmonitionsPlugin);
        }
    };

    deactivate = async () => {
        if (markdownRenderer) {
            markdownRenderer.remarkPlugins = markdownRenderer.remarkPlugins.filter((plugin) => remarkGfmBlockquoteAdmonitionsPlugin !== plugin);
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
