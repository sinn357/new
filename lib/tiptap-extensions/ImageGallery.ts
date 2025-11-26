import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageGalleryNode from '@/components/ImageGalleryNode';

export interface ImageGalleryOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGallery: {
      setImageGallery: (options: { images: string[], columns?: number }) => ReturnType;
    };
  }
}

export const ImageGallery = Node.create<ImageGalleryOptions>({
  name: 'imageGallery',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: element => {
          const images = element.getAttribute('data-images');
          return images ? JSON.parse(images) : [];
        },
        renderHTML: attributes => {
          return {
            'data-images': JSON.stringify(attributes.images),
          };
        },
      },
      columns: {
        default: 3,
        parseHTML: element => Number(element.getAttribute('data-columns')) || 3,
        renderHTML: attributes => {
          return {
            'data-columns': attributes.columns,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { images, columns } = node.attrs;

    // Generate grid HTML for non-editor view
    const gridColsClass = ({
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
    } as Record<number, string>)[columns] || 'grid-cols-3';

    const imagesHTML = images.map((src: string) =>
      ['img', { src, class: 'w-full h-auto rounded-lg object-cover', style: 'aspect-ratio: 4/3' }]
    );

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
        class: `grid ${gridColsClass} gap-4 my-4`,
      }),
      ...imagesHTML
    ];
  },

  addCommands() {
    return {
      setImageGallery:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryNode);
  },
});
