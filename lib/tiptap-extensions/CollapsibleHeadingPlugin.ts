import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const getHeadingLevel = (node: any) => {
  const level = Number(node.attrs?.level);
  return level >= 1 && level <= 6 ? level : 1;
};

export const CollapsibleHeadingPlugin = Extension.create({
  name: 'collapsibleHeadingPlugin',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const topLevel: Array<{ node: any; pos: number }> = [];

            state.doc.forEach((node, pos) => {
              topLevel.push({ node, pos });
            });

            for (let i = 0; i < topLevel.length; i += 1) {
              const current = topLevel[i];
              if (current.node.type.name !== 'heading') continue;
              if (!current.node.attrs?.collapsed) continue;

              const currentLevel = getHeadingLevel(current.node);

              for (let j = i + 1; j < topLevel.length; j += 1) {
                const next = topLevel[j];
                if (next.node.type.name === 'heading') {
                  const nextLevel = getHeadingLevel(next.node);
                  if (nextLevel <= currentLevel) {
                    break;
                  }
                }
                decorations.push(
                  Decoration.node(next.pos, next.pos + next.node.nodeSize, {
                    class: 'heading-collapsed',
                  })
                );
              }
            }

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
