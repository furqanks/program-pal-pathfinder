import React, { useEffect, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinkModal } from './LinkModal';

interface RichTextEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  className?: string;
}

export interface RichTextEditorRef {
  setContent: (content: string | any) => void;
  getHTML: () => string;
  getJSON: () => any;
}

export const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content, onChange, placeholder = 'Start writing…', className }, ref) => {
    const [linkModalOpen, setLinkModalOpen] = React.useState(false);

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false, // We'll configure this separately
          bulletList: false, // We'll configure this separately
          orderedList: false, // We'll configure this separately
          listItem: false, // We'll configure this separately
          blockquote: false, // We'll configure this separately
        }),
        Underline,
        Heading.configure({
          levels: [1, 2, 3],
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        BulletList,
        OrderedList,
        ListItem,
        Blockquote,
        Placeholder.configure({
          placeholder,
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        onChange(editor.getJSON());
      },
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
            'min-h-[300px] px-6 py-4',
            className
          ),
        },
      },
    });

    useImperativeHandle(ref, () => ({
      setContent: (newContent: string | any) => {
        if (editor) {
          if (typeof newContent === 'string') {
            editor.commands.setContent(newContent, { 
              parseOptions: { preserveWhitespace: 'full' } 
            });
          } else {
            editor.commands.setContent(newContent);
          }
        }
      },
      getHTML: () => editor?.getHTML() || '',
      getJSON: () => editor?.getJSON() || null,
    }), [editor]);

    useEffect(() => {
      if (editor && content) {
        const currentContent = editor.getJSON();
        if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
          editor.commands.setContent(content);
        }
      }
    }, [editor, content]);

    if (!editor) {
      return null;
    }

    const ToolbarButton = ({ 
      onClick, 
      isActive = false, 
      disabled = false, 
      children 
    }: {
      onClick: () => void;
      isActive?: boolean;
      disabled?: boolean;
      children: React.ReactNode;
    }) => (
      <Button
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="h-8 w-8 p-0"
      >
        {children}
      </Button>
    );

    const setHeading = (level: number | null) => {
      if (level === null) {
        editor.chain().focus().setParagraph().run();
      } else {
        editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
      }
    };

    const getCurrentHeadingLevel = () => {
      if (editor.isActive('heading', { level: 1 })) return 'h1';
      if (editor.isActive('heading', { level: 2 })) return 'h2';
      if (editor.isActive('heading', { level: 3 })) return 'h3';
      return 'paragraph';
    };

    const openLinkModal = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, '');
      
      if (text) {
        setLinkModalOpen(true);
      }
    };

    const handleLinkAdd = (url: string) => {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: '_blank' })
        .run();
    };

    const handleLinkRemove = () => {
      editor.chain().focus().unsetLink().run();
    };

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border bg-muted/30 p-2 flex items-center gap-1 flex-wrap sticky top-0 z-10">
          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <Select value={getCurrentHeadingLevel()} onValueChange={(value) => {
            if (value === 'paragraph') setHeading(null);
            else if (value === 'h1') setHeading(1);
            else if (value === 'h2') setHeading(2);
            else if (value === 'h3') setHeading(3);
          }}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Text</SelectItem>
              <SelectItem value="h1">H1</SelectItem>
              <SelectItem value="h2">H2</SelectItem>
              <SelectItem value="h3">H3</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Link */}
          <ToolbarButton
            onClick={openLinkModal}
            isActive={editor.isActive('link')}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Editor */}
        <div className="max-w-[800px] mx-auto">
          <EditorContent editor={editor} />
        </div>

        <LinkModal
          open={linkModalOpen}
          onOpenChange={setLinkModalOpen}
          onAddLink={handleLinkAdd}
          onRemoveLink={handleLinkRemove}
          isLinkActive={editor.isActive('link')}
          currentUrl={editor.getAttributes('link').href || ''}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';