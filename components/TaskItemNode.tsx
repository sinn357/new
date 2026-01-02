'use client';

import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export default function TaskItemNode({ node, updateAttributes, editor }: NodeViewProps) {
  const checked = !!node.attrs.checked;

  return (
    <NodeViewWrapper as="li" data-type="taskItem" data-checked={checked} className="task-item">
      <label className="task-item__label" contentEditable={false}>
        <input
          className="task-item__checkbox"
          type="checkbox"
          checked={checked}
          disabled={!editor.isEditable}
          onChange={(event) => updateAttributes({ checked: event.target.checked })}
        />
      </label>
      <NodeViewContent className="task-item__content" />
    </NodeViewWrapper>
  );
}
