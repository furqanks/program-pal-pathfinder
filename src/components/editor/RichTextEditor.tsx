import * as React from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import FormattingToolbar from './FormattingToolbar';

type Props = {
  initialContent: JSONContent;
  onChange?: (json: JSONContent) => void; // debounced inside
  readOnly?: boolean;
};

export default function RichTextEditor({ initialContent, onChange, readOnly }: Props) {
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
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate: ({ editor }) => {
      if (!onChange) return;
      const json = editor.getJSON();
      // simple debounce
      window.clearTimeout((editor as any).__saveT);
      (editor as any).__saveT = window.setTimeout(() => onChange(json), 800);
    },
  }, [readOnly]);

  return (
    <div className="border rounded-md bg-white">
      {!readOnly && <FormattingToolbar editor={editor} />}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}