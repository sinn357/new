'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

export default function ImageGalleryNode({
  node,
  updateAttributes,
  deleteNode,
  editor
}: NodeViewProps) {
  const { images, columns } = node.attrs;
  const [hovering, setHovering] = useState(false);

  const handleRemoveImage = (index: number) => {
    const newImages = (images as string[]).filter((_: any, i: number) => i !== index);
    if (newImages.length === 0) {
      deleteNode();
    } else {
      updateAttributes({ images: newImages });
    }
  };

  const handleChangeColumns = (newColumns: number) => {
    updateAttributes({ columns: newColumns });
  };

  const gridColsClass = ({
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  } as Record<number, string>)[columns as number] || 'grid-cols-3';

  return (
    <NodeViewWrapper className="my-4">
      <div
        className="relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Toolbar */}
        {hovering && editor.isEditable && (
          <div className="absolute -top-10 left-0 right-0 flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-t-lg z-10">
            <div className="flex gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-300 mr-2">레이아웃:</span>
              {[1, 2, 3, 4].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => handleChangeColumns(col)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    columns === col
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  {col}열
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={deleteNode}
              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              🗑️ 삭제
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        <div className={`grid ${gridColsClass} gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600`}>
          {(images as string[]).map((src: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-auto rounded-lg object-cover"
                style={{ aspectRatio: '4/3' }}
              />
              {editor.isEditable && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  title="이미지 제거"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
