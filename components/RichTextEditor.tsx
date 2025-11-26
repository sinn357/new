'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useState } from 'react';
import FileUpload from './FileUpload';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력해보세요..."
}: RichTextEditorProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg cursor-pointer',
          style: 'max-width: 100%; height: auto;'
        }
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: attributes => {
                return {
                  width: attributes.width,
                }
              },
            },
            height: {
              default: null,
              renderHTML: attributes => {
                return {
                  height: attributes.height,
                }
              },
            },
          }
        },
        addNodeView() {
          return ({ node, getPos, editor }) => {
            const container = document.createElement('div');
            container.className = 'relative inline-block group';

            const img = document.createElement('img');
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || '';
            img.className = 'rounded-lg max-w-full h-auto';
            if (node.attrs.width) img.style.width = `${node.attrs.width}px`;
            if (node.attrs.height) img.style.height = `${node.attrs.height}px`;

            // Resize handles
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity';

            let startX = 0, startY = 0, startWidth = 0;

            resizeHandle.addEventListener('mousedown', (e) => {
              e.preventDefault();
              startX = e.clientX;
              startY = e.clientY;
              startWidth = img.offsetWidth;

              const onMouseMove = (e: MouseEvent) => {
                const width = startWidth + (e.clientX - startX);
                if (width > 100) {
                  img.style.width = `${width}px`;
                  img.style.height = 'auto';
                }
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                // Update node attributes
                if (typeof getPos === 'function') {
                  editor.commands.updateAttributes('image', {
                    width: parseInt(img.style.width),
                    height: null
                  });
                }
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            });

            container.appendChild(img);
            container.appendChild(resizeHandle);

            return {
              dom: container,
            };
          };
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4'
      }
    }
  });

  const handleImageUpload = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
      setShowImageUpload(false);
    }
  };

  const addLink = () => {
    const url = window.prompt('URL을 입력하세요:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  const colors = [
    '#000000', '#374151', '#6B7280', '#EF4444', '#F59E0B',
    '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF'
  ];

  const highlightColors = [
    '#FEF3C7', '#FED7AA', '#FCA5A5', '#DDD6FE', '#BFDBFE',
    '#A7F3D0', '#FDE68A', '#FBCFE8', '#E9D5FF', 'transparent'
  ];

  return (
    <div className="w-full border border-gray-300 rounded-lg bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 flex flex-wrap items-center gap-2">
        {/* 텍스트 스타일 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="굵게 (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="기울임 (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('underline') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="밑줄 (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('strike') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="취소선"
          >
            <s>S</s>
          </button>
        </div>

        {/* 제목 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="제목 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="제목 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="제목 3"
          >
            H3
          </button>
        </div>

        {/* 정렬 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="왼쪽 정렬"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="중앙 정렬"
          >
            ↔️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="오른쪽 정렬"
          >
            ➡️
          </button>
        </div>

        {/* 리스트 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="불릿 리스트"
          >
            •••
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="숫자 리스트"
          >
            123
          </button>
        </div>

        {/* 색상 */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="텍스트 색상"
          >
            🎨
          </button>
          {showColorPicker && (
            <div className="absolute top-10 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 shadow-lg z-10">
              <div className="grid grid-cols-5 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="하이라이트"
          >
            🖍️
          </button>
          {showHighlightPicker && (
            <div className="absolute top-10 left-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 shadow-lg z-10">
              <div className="grid grid-cols-5 gap-1">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      if (color === 'transparent') {
                        editor.chain().focus().unsetHighlight().run();
                      } else {
                        editor.chain().focus().setHighlight({ color }).run();
                      }
                      setShowHighlightPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color === 'transparent' ? '제거' : color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 기타 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={addLink}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('link') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="링크"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive('blockquote') ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''
            }`}
            title="인용구"
          >
            💬
          </button>
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="px-3 py-1 text-sm bg-blue-500 dark:bg-blue-600 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            title="이미지 삽입"
          >
            📷 이미지
          </button>
        </div>
      </div>

      {/* Image Upload Panel */}
      {showImageUpload && (
        <div className="border-b border-gray-300 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">이미지 업로드</h4>
            <button
              type="button"
              onClick={() => setShowImageUpload(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <FileUpload
            onFileUpload={handleImageUpload}
            accept="image/*,video/*"
            label="이미지 또는 동영상 선택"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            이미지: JPG, PNG, GIF, WebP 등 | 동영상: MP4, WebM, MOV 등
          </p>
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
