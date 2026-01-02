import { mergeAttributes } from '@tiptap/core';
import Heading from '@tiptap/extension-heading';
import { applyHeadingCollapse } from '@/lib/heading-collapse';

export const CollapsibleHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      collapsed: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes) =>
          attributes.collapsed ? { 'data-collapsed': 'true' } : { 'data-collapsed': 'false' },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
      ? node.attrs.level
      : this.options.levels[0];
    return [
      `h${level}`,
      mergeAttributes(HTMLAttributes, {
        'data-collapsible': 'true',
        'data-level': String(level),
      }),
      0,
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const level = node.attrs.level as number;
      const dom = document.createElement(`h${level}`);
      dom.setAttribute('data-collapsible', 'true');
      dom.setAttribute('data-level', String(level));
      dom.setAttribute('data-collapsed', node.attrs.collapsed ? 'true' : 'false');

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'heading-toggle';
      button.textContent = node.attrs.collapsed ? '▸' : '▾';
      button.setAttribute('contenteditable', 'false');
      button.tabIndex = -1;

      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });

      button.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof getPos !== 'function') return;
        const pos = getPos();
        if (typeof pos !== 'number') return;
        const collapsed = !node.attrs.collapsed;
        editor.commands.command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, { ...node.attrs, collapsed });
          return true;
        });
        if (editor?.view?.dom) {
          requestAnimationFrame(() => applyHeadingCollapse(editor.view.dom));
        }
      });

      const content = document.createElement('span');
      content.className = 'heading-toggle__text';

      dom.appendChild(button);
      dom.appendChild(content);

      return {
        dom,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'heading') return false;
          dom.setAttribute('data-collapsed', updatedNode.attrs.collapsed ? 'true' : 'false');
          button.textContent = updatedNode.attrs.collapsed ? '▸' : '▾';
          return true;
        },
      };
    };
  },
});
