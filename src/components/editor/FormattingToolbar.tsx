import * as React from 'react';
import type { Editor } from '@tiptap/react';

type Props = { editor: Editor | null };

export default function FormattingToolbar({ editor }: Props) {
  if (!editor) return null;
  const B = (p: React.ButtonHTMLAttributes<HTMLButtonElement> & {active?: boolean}) =>
    <button {...p} className={`px-2 py-1 rounded border text-sm ${p.active ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50`} />;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-white/90 backdrop-blur p-2">
      <B onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} aria-label="Bold (Ctrl/Cmd+B)">B</B>
      <B onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} aria-label="Italic (Ctrl/Cmd+I)"><em>I</em></B>
      <B onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} aria-label="Underline (Ctrl/Cmd+U)"><u>U</u></B>

      <select
        aria-label="Heading level"
        className="px-2 py-1 border rounded bg-white"
        value={
          editor.isActive('heading', { level: 1 }) ? 'h1' :
          editor.isActive('heading', { level: 2 }) ? 'h2' :
          editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
        }
        onChange={(e) => {
          const v = e.target.value;
          editor.chain().focus()
            .setParagraph()
            .run();
          if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
          if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
          if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <B onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} aria-label="Bulleted list">• List</B>
      <B onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} aria-label="Numbered list">1. List</B>
      <B onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} aria-label="Blockquote">" "</B>

      <div className="ml-auto flex gap-2">
        <B onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">↶</B>
        <B onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">↷</B>
      </div>
    </div>
  );
}