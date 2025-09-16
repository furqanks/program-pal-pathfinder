import * as React from 'react';
import { useEditor, EditorContent, JSONContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

type Props = {
  initialContent?: JSONContent;
  onChange?: (json: JSONContent) => void;
  readOnly?: boolean;
  className?: string;
};

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const Btn = ({ active, disabled, onClick, children, label }:{
    active?: boolean; disabled?: boolean; onClick:()=>void; children: React.ReactNode; label:string;
  }) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 text-sm rounded border ${active ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'} disabled:opacity-50`}
    >
      {children}
    </button>
  );

  return (
    <div data-testid="rte-toolbar" className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b bg-white/95 backdrop-blur p-2">
      <Btn label="Bold (Ctrl/Cmd+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>B</Btn>
      <Btn label="Italic (Ctrl/Cmd+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><em>I</em></Btn>
      <Btn label="Underline (Ctrl/Cmd+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><u>U</u></Btn>

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
          const ch = editor.chain().focus();
          if (v === 'p') ch.setParagraph().run();
          if (v === 'h1') ch.setHeading({ level: 1 }).run();
          if (v === 'h2') ch.setHeading({ level: 2 }).run();
          if (v === 'h3') ch.setHeading({ level: 3 }).run();
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <Btn label="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• List</Btn>
      <Btn label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1. List</Btn>
      <Btn label="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>" "</Btn>

      <div className="ml-auto flex gap-2">
        <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()}>↶</Btn>
        <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()}>↷</Btn>
      </div>
    </div>
  );
}

export default function RichTextEditor({ initialContent, onChange, readOnly, className }: Props) {
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Link.configure({ openOnClick: true, autolink: true }),
      Placeholder.configure({ placeholder: 'Start writing your document…' }),
    ],
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      if (!onChange) return;
      const json = editor.getJSON();
      clearTimeout((editor as any).__saveT);
      (editor as any).__saveT = setTimeout(() => onChange(json), 800);
    },
  }, [readOnly]);

  return (
    <div className={`rounded-md bg-white ${className || ''}`} data-testid="rte-root">
      {!readOnly && <Toolbar editor={editor} />}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}