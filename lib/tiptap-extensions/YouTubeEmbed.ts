import { Node, mergeAttributes } from '@tiptap/core';

export interface YouTubeEmbedOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youTubeEmbed: {
      setYouTubeEmbed: (options: {
        src: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}

export const YouTubeEmbed = Node.create<YouTubeEmbedOptions>({
  name: 'youTubeEmbed',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 960,
      },
      height: {
        default: 540,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[data-youtube-embed="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'iframe',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-youtube-embed': 'true',
        src: HTMLAttributes.src,
        width: HTMLAttributes.width,
        height: HTMLAttributes.height,
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowfullscreen: 'true',
      }),
    ];
  },

  addCommands() {
    return {
      setYouTubeEmbed:
        (options) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    };
  },
});
