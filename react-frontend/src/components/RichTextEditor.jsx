'use client'

import { useEffect, useRef } from "react";
import { Box, Button, HStack, Text, Icon } from "@chakra-ui/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { FiBold, FiItalic, FiUnderline, FiList, FiLink, FiImage } from "react-icons/fi";

const ToolbarButton = ({ active, disabled, onClick, children, title, icon }) => (
  <Button
    size="xs"
    height="30px"
    minW="32px"
    px={children ? 2.5 : 2}
    fontSize="12px"
    fontWeight="600"
    fontFamily="'Inter', var(--font-inter), sans-serif"
    bg={active ? "#263A33" : "white"}
    color={active ? "white" : "#263A33"}
    border="1px solid"
    borderColor={active ? "#263A33" : "rgba(86, 117, 109, 0.2)"}
    borderRadius="md"
    isDisabled={disabled}
    onClick={onClick}
    title={title}
    boxShadow="0 1px 2px rgba(38, 58, 51, 0.04)"
    _hover={{
      bg: active ? "#182722" : "#FAF8F5",
      borderColor: active ? "#182722" : "rgba(86, 117, 109, 0.35)",
    }}
    _active={{
      bg: "#263A33",
      color: "white",
    }}
    transition="all 0.15s"
  >
    {icon && <Icon as={icon} boxSize="12px" mr={children ? 1.5 : 0} />}
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
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
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
      <HStack 
        spacing={1.5} 
        mb={2.5} 
        flexWrap="wrap" 
        p={1.5}
        bg="rgba(86, 117, 109, 0.05)"
        borderRadius="xl"
        border="1px solid"
        borderColor="rgba(86, 117, 109, 0.12)"
        w="fit-content"
      >
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Text as="span" fontWeight="800">B</Text>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Text as="span" fontStyle="italic">I</Text>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <Text as="span" textDecoration="underline">U</Text>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          • List
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          1. List
        </ToolbarButton>

        <ToolbarButton 
          active={editor.isActive("link")}
          onClick={setLink}
          icon={FiLink}
          title="Add Link"
        >
          Link
        </ToolbarButton>

        {allowImages && (
          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            icon={FiImage}
            title="Upload Image"
          >
            Image
          </ToolbarButton>
        )}
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
        borderColor="rgba(86, 117, 109, 0.2)"
        borderRadius="xl"
        bg="white"
        px={{ base: 4, md: 5 }}
        py={4}
        minH={minHeight}
        transition="border-color 0.2s, box-shadow 0.2s"
        _focusWithin={{
          borderColor: "#56756D",
          boxShadow: "0 0 0 1px #56756D",
        }}
        sx={{
          ".ProseMirror": {
            outline: "none",
            minHeight,
            fontSize: "13.5px",
            color: "#263A33",
            lineHeight: "1.65",
            fontFamily: "'Inter', var(--font-inter), sans-serif",
          },
          ".ProseMirror ol": {
            listStyleType: "decimal !important",
            paddingLeft: "28px !important",
            margin: "14px 0 !important",
          },
          ".ProseMirror ul": {
            listStyleType: "disc !important",
            paddingLeft: "28px !important",
            margin: "14px 0 !important",
          },
          ".ProseMirror li": {
            margin: "8px 0 !important",
            lineHeight: "1.75 !important",
            paddingLeft: "6px !important",
          },
          ".ProseMirror li p": {
            margin: "0 !important",
            display: "inline-block",
            lineHeight: "1.75",
          },
          ".ProseMirror p": {
            margin: "0.75em 0",
            lineHeight: "1.75",
          },
          ".ProseMirror p:last-child": {
            marginBottom: "0",
          },
          ".ProseMirror blockquote": {
            borderLeft: "3px solid #56756D",
            paddingLeft: "1rem",
            margin: "0.75rem 0",
            color: "#5A6E65",
          },
          ".ProseMirror p.is-editor-empty:first-of-type::before": {
            color: "#A0AEC0",
            content: "attr(data-placeholder)",
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
          ".ProseMirror img": {
            maxWidth: "100%",
            borderRadius: "10px",
            marginTop: "8px",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
