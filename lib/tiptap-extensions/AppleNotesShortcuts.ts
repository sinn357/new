import { Extension } from '@tiptap/core';

/**
 * Apple Notes 스타일 키보드 단축키 Extension
 *
 * 지원하는 단축키:
 * - Shift+Cmd+7: Bullet List
 * - Shift+Cmd+8: Bullet List (Dash List 대체)
 * - Shift+Cmd+9: Ordered List
 * - Shift+Cmd+L: Checklist (Task List)
 * - Shift+Cmd+U: Toggle checklist completion
 * - Cmd+K: Add Link
 * - Cmd+': Block Quote
 * - Cmd+U: Underline
 * - Shift+Cmd+T: Title (Heading 1)
 * - Shift+Cmd+H: Heading (Heading 2)
 * - Shift+Cmd+J: Subheading (Heading 3)
 * - Shift+Cmd+B: Body (Paragraph)
 * - Shift+Cmd+M: Monospaced (Code Block)
 * - Option+Cmd+T: Insert Table
 * - Cmd+]: Indent (Sink List Item)
 * - Cmd+[: Outdent (Lift List Item)
 */
export const AppleNotesShortcuts = Extension.create({
  name: 'appleNotesShortcuts',

  addKeyboardShortcuts() {
    return {
      // 리스트 단축키 (숫자 키는 Shift와 함께 사용하면 특수문자가 되므로 두 가지 모두 처리)
      'Mod-Shift-7': () => this.editor.commands.toggleBulletList(),
      'Mod-&': () => this.editor.commands.toggleBulletList(), // Shift+7 = &
      'Mod-Shift-8': () => this.editor.commands.toggleBulletList(),
      'Mod-*': () => this.editor.commands.toggleBulletList(), // Shift+8 = *
      'Mod-Shift-9': () => this.editor.commands.toggleOrderedList(),
      'Mod-(': () => this.editor.commands.toggleOrderedList(), // Shift+9 = (
      'Mod-Shift-L': () => this.editor.commands.toggleTaskList(),

      // 체크리스트 토글
      'Mod-Shift-U': () => this.editor.commands.toggleTaskList(),

      // 링크 (Cmd+K)
      'Mod-K': () => {
        const url = window.prompt('URL을 입력하세요:');
        if (url) {
          return this.editor.chain().focus().setLink({ href: url }).run();
        }
        return false;
      },

      // 인용구 (Cmd+')
      "Mod-'": () => this.editor.commands.toggleBlockquote(),

      // Underline (Cmd+U)
      'Mod-U': () => this.editor.commands.toggleUnderline(),

      // 텍스트 스타일
      'Mod-Shift-T': () => this.editor.commands.setHeading({ level: 1 }), // Title
      'Mod-Shift-H': () => this.editor.commands.setHeading({ level: 2 }), // Heading
      'Mod-Shift-J': () => this.editor.commands.setHeading({ level: 3 }), // Subheading
      'Mod-Shift-B': () => this.editor.commands.setParagraph(), // Body
      'Mod-Shift-M': () => this.editor.commands.toggleCodeBlock(), // Monospaced

      // 테이블
      'Alt-Mod-T': () => this.editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),

      // 인덴트 (리스트 아이템에서만 작동)
      'Mod-]': () => {
        // BulletList, OrderedList, TaskList에서 indent
        if (
          this.editor.isActive('bulletList') ||
          this.editor.isActive('orderedList') ||
          this.editor.isActive('taskList')
        ) {
          return this.editor.commands.sinkListItem('listItem') ||
                 this.editor.commands.sinkListItem('taskItem');
        }
        return false;
      },
      'Mod-[': () => {
        // BulletList, OrderedList, TaskList에서 outdent
        if (
          this.editor.isActive('bulletList') ||
          this.editor.isActive('orderedList') ||
          this.editor.isActive('taskList')
        ) {
          return this.editor.commands.liftListItem('listItem') ||
                 this.editor.commands.liftListItem('taskItem');
        }
        return false;
      },
    };
  },
});
