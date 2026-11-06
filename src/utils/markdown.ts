import { Marked } from 'marked';

const OWN_SITE = /^https?:\/\/(www\.)?kokoneko\.art(?=[/?#]|$)/;

const marked = new Marked({
  gfm: true,
  renderer: {
    // Absolute links open in a new tab and get the same hooks as ButtonLink's external links.
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const t = title ? ` title="${title}"` : '';
      const external = /^https?:\/\//.test(href) && !OWN_SITE.test(href);
      return external
        ? `<a href="${href}"${t} target="_blank" rel="external noopener" aria-describedby="external-hint">${text}</a>`
        : `<a href="${href}"${t}>${text}</a>`;
    },
  },
});

/** Markdown (from frontmatter) to HTML. Content is written by you, so it is not sanitised. */
export const renderMarkdown = (md: string): string => marked.parse(md, { async: false }) as string;