'use client'

import { useEffect, useRef } from "react";

import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const ToolbarButton = ({ active, disabled, onClick, children }) => (
  <Button
    size="sm"
    variant={active ? "solid" : "ghost"}
    isDisabled={disabled}
    onClick={onClick}
    borderRadius="full"
  >
    {children}
  </Button>
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  isPremium = false,
  minHeight = "180px",
  allowImages = true,
}) {
  const fileInputRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder || "Start writing..." }),
    ],
    content: value || "",
    onUpdate: ({ editor: editorInstance }) => {
      onChange?.({
        html: editorInstance.getHTML(),
        text: editorInstance.getText(),
      });
    },
  });

  useEffect(() => {
    if (!editor || value == null) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter a link URL", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = (file) => {
    if (!file || !allowImages) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      editor.chain().focus().setImage({ src: result }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box>
      <HStack spacing={2} mb={2} flexWrap="wrap">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </ToolbarButton>
        <ToolbarButton onClick={setLink}>
          Link
        </ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
        >
          Image
        </ToolbarButton>
      </HStack>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        style={{ display: "none" }}
        onChange={(e) => addImage(e.target.files?.[0])}
      />

      <Box
        border="1px solid"
        borderColor="gray.200"
        borderRadius="2xl"
        bg="white"
        px={4}
        py={3}
        minH={minHeight}
        sx={{
          ".ProseMirror": {
            outline: "none",
            minHeight,
          },
          ".ProseMirror img": {
            maxWidth: "100%",
            borderRadius: "12px",
            marginTop: "8px",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
