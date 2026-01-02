import { mergeAttributes, Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    collapsibleBlock: {
      insertCollapsible: () => ReturnType;
      toggleCollapsible: () => ReturnType;
    };
  }
}

export const CollapsibleSummary = Node.create({
  name: 'collapsibleSummary',

  content: 'inline*',
  group: 'block',
  defining: true,
  isolating: true,

  parseHTML() {
    return [{ tag: 'summary' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', HTMLAttributes, 0];
  },
});

export const CollapsibleBlock = Node.create({
  name: 'collapsible',

  group: 'block',
  content: 'collapsibleSummary block*',
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: element => element.hasAttribute('open'),
        renderHTML: attributes => (attributes.open ? { open: 'open' } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'details[data-collapsible]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(HTMLAttributes, { 'data-collapsible': 'true' }),
      0,
    ];
  },

  addCommands() {
    return {
      insertCollapsible:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { open: true },
            content: [
              {
                type: 'collapsibleSummary',
                content: [{ type: 'text', text: '접기 제목' }],
              },
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '내용을 입력하세요.' }],
              },
            ],
          }),
      toggleCollapsible:
        () =>
        ({ state, dispatch }) => {
          const { $from } = state.selection;
          for (let depth = $from.depth; depth > 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === this.name) {
              const pos = $from.before(depth);
              const open = !node.attrs.open;
              const tr = state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                open,
              });
              if (dispatch) {
                dispatch(tr);
              }
              return true;
            }
          }
          return false;
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('details');
      dom.setAttribute('data-collapsible', 'true');
      if (node.attrs.open) {
        dom.setAttribute('open', 'open');
      }

      const handleToggle = () => {
        const open = dom.hasAttribute('open');
        if (typeof getPos !== 'function') return;
        const pos = getPos();
        if (typeof pos !== 'number') return;
        editor.commands.command(({ tr }) => {
          const current = editor.state.doc.nodeAt(pos);
          const attrs = current ? { ...current.attrs, open } : { open };
          tr.setNodeMarkup(pos, undefined, attrs);
          return true;
        });
      };

      dom.addEventListener('toggle', handleToggle);

      return {
        dom,
        contentDOM: dom,
        update(updatedNode) {
          if (updatedNode.type.name !== 'collapsible') return false;
          if (updatedNode.attrs.open) {
            dom.setAttribute('open', 'open');
          } else {
            dom.removeAttribute('open');
          }
          return true;
        },
        destroy() {
          dom.removeEventListener('toggle', handleToggle);
        },
      };
    };
  },
});
