import { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, IconButton, HStack, Tooltip, Divider } from '@chakra-ui/react';
import { 
    FiBold, FiItalic, FiUnderline, FiType, FiAlignLeft, 
    FiAlignCenter, FiAlignRight, FiList, FiImage, FiLink 
} from 'react-icons/fi';
import { MdFormatStrikethrough, MdFormatListNumbered } from 'react-icons/md';

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Enter Image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const NavButton = ({ icon, onClick, isActive, label }) => (
        <Tooltip label={label} hasArrow placement="top">
            <IconButton
                icon={icon}
                size="sm"
                h="32px"
                w="32px"
                minW="32px"
                borderRadius="lg"
                bg={isActive ? '#56756D' : 'transparent'}
                color={isActive ? 'white' : '#5A6E65'}
                boxShadow={isActive ? '0 2px 6px rgba(86, 117, 109, 0.22)' : 'none'}
                _hover={{
                    bg: isActive ? '#263A33' : 'rgba(86, 117, 109, 0.1)',
                    color: isActive ? 'white' : '#263A33',
                }}
                onClick={onClick}
                aria-label={label}
            />
        </Tooltip>
    );

    return (
        <HStack 
            spacing={1.5} 
            p={2} 
            px={3}
            borderBottom="1px solid rgba(86, 117, 109, 0.12)" 
            bg="rgba(250, 248, 245, 0.9)" 
            flexWrap="wrap" 
            borderTopRadius="xl"
        >
            <NavButton icon={<FiBold />} onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold" />
            <NavButton icon={<FiItalic />} onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic" />
            <NavButton icon={<FiUnderline />} onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} label="Underline" />
            <NavButton icon={<MdFormatStrikethrough />} onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strikethrough" />
            
            <Divider orientation="vertical" h="20px" mx={1.5} borderColor="rgba(86, 117, 109, 0.18)" />
            
            <NavButton icon={<FiType />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="Heading 2" />
            
            <Divider orientation="vertical" h="20px" mx={1.5} borderColor="rgba(86, 117, 109, 0.18)" />
            
            <NavButton icon={<FiAlignLeft />} onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} label="Align Left" />
            <NavButton icon={<FiAlignCenter />} onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} label="Align Center" />
            <NavButton icon={<FiAlignRight />} onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} label="Align Right" />
            
            <Divider orientation="vertical" h="20px" mx={1.5} borderColor="rgba(86, 117, 109, 0.18)" />
            
            <NavButton icon={<FiList />} onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List" />
            <NavButton icon={<MdFormatListNumbered />} onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List" />
            
            <Divider orientation="vertical" h="20px" mx={1.5} borderColor="rgba(86, 117, 109, 0.18)" />
            
            <NavButton icon={<FiLink />} onClick={addLink} isActive={editor.isActive('link')} label="Add Link" />
            <NavButton icon={<FiImage />} onClick={addImage} label="Add Image" />
        </HStack>
    );
};

const RichTextEditor = forwardRef(function RichTextEditor({ content, onChange }, ref) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Start writing your blog post...' }),
        ],
        content: content || '',
        onUpdate: ({ editor: activeEditor }) => {
            onChange(activeEditor.getHTML());
        },
    });

    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || '',
    }), [editor]);

    useEffect(() => {
        if (!editor) return;
        const next = content || '';
        const current = editor.getHTML();
        if (next !== current) {
            editor.commands.setContent(next, false);
        }
    }, [editor, content]);

    return (
        <Box 
            border="1px solid" 
            borderColor="rgba(86, 117, 109, 0.2)" 
            borderRadius="xl" 
            overflow="hidden" 
            bg="white"
            transition="all 0.2s ease"
            _hover={{ borderColor: "rgba(86, 117, 109, 0.35)" }}
            _focusWithin={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
        >
            <MenuBar editor={editor} />
            <Box 
                p={5} 
                minH="340px" 
                fontFamily="'Inter', var(--font-inter), sans-serif"
                sx={{
                    '.ProseMirror': { 
                        outline: 'none', 
                        minHeight: '320px',
                        fontFamily: "'Inter', var(--font-inter), sans-serif",
                        fontSize: '14px',
                        lineHeight: '1.75',
                        color: '#263A33',
                    },
                    '.ProseMirror p': { 
                        margin: '0.75em 0',
                        lineHeight: '1.75',
                        color: '#263A33',
                    },
                    '.ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4': {
                        fontFamily: "'Outfit', var(--font-outfit), sans-serif",
                        color: '#263A33',
                        fontWeight: '600',
                        lineHeight: '1.3',
                        margin: '1.3em 0 0.5em 0',
                    },
                    '.ProseMirror h2': {
                        fontSize: '20px',
                        letterSpacing: '-0.015em',
                    },
                    '.ProseMirror ul': {
                        listStyleType: 'disc !important',
                        paddingLeft: '28px !important',
                        margin: '14px 0 !important',
                    },
                    '.ProseMirror ol': {
                        listStyleType: 'decimal !important',
                        paddingLeft: '28px !important',
                        margin: '14px 0 !important',
                    },
                    '.ProseMirror ul ul': {
                        listStyleType: 'circle !important',
                        margin: '6px 0 !important',
                    },
                    '.ProseMirror ol ol': {
                        listStyleType: 'lower-alpha !important',
                        margin: '6px 0 !important',
                    },
                    '.ProseMirror li': {
                        margin: '8px 0 !important',
                        lineHeight: '1.75 !important',
                        color: '#263A33 !important',
                        paddingLeft: '6px !important',
                    },
                    '.ProseMirror li p': {
                        margin: '0 !important',
                        display: 'inline-block',
                        lineHeight: '1.75',
                    },
                    '.ProseMirror blockquote': {
                        borderLeft: '3px solid #56756D',
                        paddingLeft: '1.1rem',
                        margin: '1.2em 0',
                        color: '#5A6E65',
                        bg: 'rgba(86, 117, 109, 0.05)',
                        py: '0.6rem',
                        borderRadius: 'sm',
                    },
                    '.ProseMirror a': {
                        color: '#56756D',
                        textDecoration: 'underline',
                        fontWeight: '500',
                    },
                    '.ProseMirror strong': {
                        fontWeight: '600',
                        color: '#182722',
                    },
                    '.ProseMirror p.is-editor-empty:first-of-type::before': {
                        content: 'attr(data-placeholder)',
                        float: 'left',
                        color: '#718096',
                        fontFamily: "'Inter', var(--font-inter), sans-serif",
                        pointerEvents: 'none',
                        height: 0,
                    },
                    '.ProseMirror img': { 
                        maxWidth: '100%', 
                        height: 'auto', 
                        borderRadius: '12px', 
                        my: 4,
                        border: '1px solid rgba(86, 117, 109, 0.15)',
                    }
                }}
            >
                <EditorContent editor={editor} />
            </Box>
        </Box>
    );
});

export default RichTextEditor;
