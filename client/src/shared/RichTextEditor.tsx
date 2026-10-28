import React from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  id?: string;
}

const ToolbarButton: React.FC<{
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ label, icon: Icon, active, disabled, onClick }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    // keep the editor focused and the selection intact
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      "flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40",
      active && "bg-accent text-accent-foreground"
    )}
  >
    <Icon className="size-4" />
  </button>
);

const Divider = () => <span className="mx-1 h-5 w-px bg-border" />;

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
  id,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id: id ?? "",
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[220px] px-3 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            quote: editor.isActive("blockquote"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : null,
  });

  if (!editor || !state) return null;

  const chain = () => editor.chain().focus();

  return (
    <div className="rounded-md border bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
      <div className="flex flex-wrap items-center gap-0.5 border-b p-1.5">
        <ToolbarButton
          label="Bold"
          icon={Bold}
          active={state.bold}
          onClick={() => chain().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={Italic}
          active={state.italic}
          onClick={() => chain().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          icon={Underline}
          active={state.underline}
          onClick={() => chain().toggleUnderline().run()}
        />
        <Divider />
        <ToolbarButton
          label="Heading"
          icon={Heading2}
          active={state.h2}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Subheading"
          icon={Heading3}
          active={state.h3}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        />
        <Divider />
        <ToolbarButton
          label="Bulleted list"
          icon={List}
          active={state.bullet}
          onClick={() => chain().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon={ListOrdered}
          active={state.ordered}
          onClick={() => chain().toggleOrderedList().run()}
        />
        <ToolbarButton
          label="Quote"
          icon={Quote}
          active={state.quote}
          onClick={() => chain().toggleBlockquote().run()}
        />
        <Divider />
        <ToolbarButton
          label="Undo"
          icon={Undo2}
          disabled={!state.canUndo}
          onClick={() => chain().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          icon={Redo2}
          disabled={!state.canRedo}
          onClick={() => chain().redo().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
