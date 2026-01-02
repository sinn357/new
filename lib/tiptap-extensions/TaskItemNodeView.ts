import TaskItem from '@tiptap/extension-task-item';
import { ReactNodeViewRenderer } from '@tiptap/react';
import TaskItemNode from '@/components/TaskItemNode';

export const TaskItemNodeView = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemNode);
  },
});
