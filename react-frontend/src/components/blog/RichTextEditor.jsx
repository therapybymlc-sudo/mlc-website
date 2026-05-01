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
                variant={isActive ? 'solid' : 'ghost'}
                colorScheme={isActive ? 'teal' : 'gray'}
                onClick={onClick}
                aria-label={label}
            />
        </Tooltip>
    );

    return (
        <HStack spacing={1} p={2} borderBottom="1px solid" borderColor="gray.200" bg="gray.50" flexWrap="wrap" borderTopRadius="md">
            <NavButton icon={<FiBold />} onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold" />
            <NavButton icon={<FiItalic />} onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic" />
            <NavButton icon={<FiUnderline />} onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} label="Underline" />
            <NavButton icon={<MdFormatStrikethrough />} onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strikethrough" />
            
            <Divider orientation="vertical" h="20px" mx={2} />
            
            <NavButton icon={<FiType />} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="Heading 2" />
            
            <Divider orientation="vertical" h="20px" mx={2} />
            
            <NavButton icon={<FiAlignLeft />} onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} label="Align Left" />
            <NavButton icon={<FiAlignCenter />} onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} label="Align Center" />
            <NavButton icon={<FiAlignRight />} onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} label="Align Right" />
            
            <Divider orientation="vertical" h="20px" mx={2} />
            
            <NavButton icon={<FiList />} onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet List" />
            <NavButton icon={<MdFormatListNumbered />} onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Ordered List" />
            
            <Divider orientation="vertical" h="20px" mx={2} />
            
            <NavButton icon={<FiLink />} onClick={addLink} isActive={editor.isActive('link')} label="Add Link" />
            <NavButton icon={<FiImage />} onClick={addImage} label="Add Image" />
        </HStack>
    );
};

export default function RichTextEditor({ content, onChange }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image.configure({ inline: true }),
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Start writing your blog post...' }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <Box border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden" bg="white">
            <MenuBar editor={editor} />
            <Box p={4} minH="300px" sx={{
                '.ProseMirror': { outline: 'none', minHeight: '300px' },
                '.ProseMirror p': { margin: '0.5em 0' },
                '.ProseMirror p.is-editor-empty:first-of-type::before': {
                    content: 'attr(data-placeholder)',
                    float: 'left',
                    color: 'gray.400',
                    pointerEvents: 'none',
                    height: 0,
                },
                '.ProseMirror img': { maxWidth: '100%', height: 'auto', borderRadius: '8px', my: 4 }
            }}>
                <EditorContent editor={editor} />
            </Box>
        </Box>
    );
}
