import { useState, useEffect } from 'react';
import { 
    Box, Flex, VStack, HStack, FormControl, FormLabel, Input, Button, 
    Textarea, Select, useToast, Switch, Heading, IconButton 
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import api from '../../api';

export default function BlogEditor({ initialData = null, isEdit = false }) {
    const router = useRouter();
    const toast = useToast();
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        cover_image_url: '',
        status: 'draft',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        category_id: '',
        tag_ids: [],
    });
    
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMetadata();
        if (initialData) {
            setFormData({
                ...initialData,
                category_id: initialData.category?.id || '',
                tag_ids: initialData.tags?.map(t => t.id) || [],
            });
        }
    }, [initialData]);

    const fetchMetadata = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                api.get('/blog/admin/categories/'),
                api.get('/blog/admin/tags/')
            ]);
            setCategories(catRes.data);
            setTags(tagRes.data);
        } catch (error) {
            console.error("Failed to load metadata", error);
        }
    };

    // Auto-generate slug from title if empty
    const handleTitleChange = (e) => {
        const val = e.target.value;
        if (!isEdit && !formData.slug) {
            const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData({ ...formData, title: val, slug: autoSlug });
        } else {
            setFormData({ ...formData, title: val });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (isEdit) {
                await api.patch(`/blog/admin/posts/${initialData.slug}/`, formData);
                toast({ title: 'Post updated', status: 'success' });
            } else {
                await api.post('/blog/admin/posts/', formData);
                toast({ title: 'Post created', status: 'success' });
                router.push('/admin/blog');
            }
        } catch (error) {
            toast({ title: 'Error saving post', description: error.response?.data?.detail || 'Unknown error', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={8} maxW="7xl" mx="auto">
            <Flex align="center" mb={8} gap={4}>
                <IconButton icon={<FiArrowLeft />} onClick={() => router.push('/admin/blog')} aria-label="Back" variant="ghost" />
                <Heading size="lg" color="gray.800">{isEdit ? 'Edit Post' : 'Create New Post'}</Heading>
                <HStack ml="auto">
                    <FormControl display="flex" alignItems="center" w="auto">
                        <FormLabel htmlFor="publish-status" mb="0" fontSize="sm" fontWeight="600">
                            {formData.status === 'published' ? 'Published' : 'Draft'}
                        </FormLabel>
                        <Switch 
                            id="publish-status" colorScheme="teal" 
                            isChecked={formData.status === 'published'}
                            onChange={(e) => setFormData({...formData, status: e.target.checked ? 'published' : 'draft'})} 
                        />
                    </FormControl>
                    <Button colorScheme="teal" leftIcon={<FiSave />} onClick={handleSave} isLoading={loading}>
                        Save Post
                    </Button>
                </HStack>
            </Flex>

            <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
                <VStack spacing={6} flex="1" align="stretch">
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input size="lg" fontWeight="bold" value={formData.title} onChange={handleTitleChange} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Content</FormLabel>
                                <RichTextEditor 
                                    content={formData.content} 
                                    onChange={(html) => setFormData({...formData, content: html})} 
                                />
                            </FormControl>
                        </VStack>
                    </Box>

                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="md" mb={4}>SEO & Metadata</Heading>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Meta Title</FormLabel>
                                <Input value={formData.meta_title} onChange={e => setFormData({...formData, meta_title: e.target.value})} placeholder="Optimized title for search engines" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Meta Description</FormLabel>
                                <Textarea value={formData.meta_description} onChange={e => setFormData({...formData, meta_description: e.target.value})} placeholder="Short description for search results" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Meta Keywords</FormLabel>
                                <Input value={formData.meta_keywords} onChange={e => setFormData({...formData, meta_keywords: e.target.value})} placeholder="therapy, anxiety, etc (comma separated)" />
                            </FormControl>
                        </VStack>
                    </Box>
                </VStack>

                <VStack spacing={6} w={{ base: 'full', lg: '350px' }} align="stretch">
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="md" mb={4}>Publishing</Heading>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>URL Slug</FormLabel>
                                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="e.g. my-first-post" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Cover Image URL</FormLabel>
                                <Input value={formData.cover_image_url} onChange={e => setFormData({...formData, cover_image_url: e.target.value})} placeholder="https://..." />
                                {formData.cover_image_url && (
                                    <Box mt={3} borderRadius="md" overflow="hidden" h="150px">
                                        <img src={formData.cover_image_url} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                )}
                            </FormControl>
                            <FormControl>
                                <FormLabel>Category</FormLabel>
                                <Select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} placeholder="Select category">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            </FormControl>
                            {/* Tags would require a multi-select component like chakra-react-select */}
                            <FormControl>
                                <FormLabel>Tags (Hold cmd/ctrl to select multiple)</FormLabel>
                                <Select multiple h="150px" value={formData.tag_ids} onChange={e => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setFormData({...formData, tag_ids: selected});
                                }}>
                                    {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </Select>
                            </FormControl>
                        </VStack>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
}
