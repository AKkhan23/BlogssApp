'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PostFormData } from '@/types/post.types';

interface PostFormProps {
  initialData?: Partial<PostFormData>;
  onSubmit: (data: PostFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

type ToolbarItem = {
  label: string;
  action: () => void;
  isActive: boolean;
};

export function PostForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Publish Post',
}: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialData?.content ?? '',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none text-gray-900 dark:text-white',
      },
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    const contentText = editor?.getText().trim() ?? '';
    if (contentText.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !validate()) return;

    await onSubmit({
      title: title.trim(),
      content: editor.getHTML(),
      coverImage: coverImage.trim() || undefined,
    });
  };

  const toolbarItems: ToolbarItem[] = editor
    ? [
        {
          label: 'B',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive('bold'),
        },
        {
          label: 'I',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive('italic'),
        },
        {
          label: 'H1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive('heading', { level: 1 }),
        },
        {
          label: 'H2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive('heading', { level: 2 }),
        },
        {
          label: 'H3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive('heading', { level: 3 }),
        },
        {
          label: '• List',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive('bulletList'),
        },
        {
          label: '1. List',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive('orderedList'),
        },
        {
          label: '" Quote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive('blockquote'),
        },
        {
          label: '</> Code',
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive('codeBlock'),
        },
      ]
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Write an engaging title..."
        required
        error={errors.title}
      />

      {/* Cover Image */}
      <Input
        label="Cover Image URL (optional)"
        type="url"
        value={coverImage}
        onChange={(e) => setCoverImage(e.target.value)}
        placeholder="https://example.com/image.jpg"
        error={errors.coverImage}
        helperText="Paste a direct URL to your cover image"
      />

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Content <span className="text-red-500">*</span>
        </label>

        <div
          className={[
            'border rounded-xl overflow-hidden',
            errors.content
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600',
          ].join(' ')}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {toolbarItems.map(({ label, action, isActive }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={[
                  'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
            {editor && (
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().unsetAllMarks().clearNodes().run()
                }
                className="ml-auto px-2.5 py-1 text-xs rounded text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Editor Content */}
          <div className="bg-white dark:bg-gray-800 min-h-[300px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.content}
          </p>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        size="lg"
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
