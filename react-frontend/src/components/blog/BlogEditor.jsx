import { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Box, Flex, VStack, HStack, FormControl, FormLabel, Input, Button, 
    Textarea, Select, useToast, Heading, IconButton, Text, Badge, Divider
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiPlus, FiGlobe } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { CreatableSelect } from 'chakra-react-select';
import RichTextEditor from './RichTextEditor';
import api from '../../api';

function normalizeImageUrl(raw) {
    const value = (raw || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value}`;
}

function slugifyLabel(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildPostPayload(formData, coverPreviewUrl, contentHtml) {
    return {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: contentHtml,
        cover_image_url: coverPreviewUrl || null,
        status: formData.status,
        meta_title: formData.meta_title || '',
        meta_description: formData.meta_description || '',
        meta_keywords: formData.meta_keywords || '',
        category_id: formData.category_id ? Number(formData.category_id) : null,
        tag_ids: (formData.tag_ids || []).map(id => Number(id)),
    };
}

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
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [coverPreviewError, setCoverPreviewError] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        fetchMetadata();
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                content: initialData.content || '',
                cover_image_url: initialData.cover_image_url || '',
                status: initialData.status || 'draft',
                meta_title: initialData.meta_title || '',
                meta_description: initialData.meta_description || '',
                meta_keywords: initialData.meta_keywords || '',
                category_id: initialData.category?.id || '',
                tag_ids: initialData.tags?.map(t => t.id) || [],
            });
        }
    }, [initialData]);

    useEffect(() => {
        setCoverPreviewError(false);
    }, [formData.cover_image_url]);

    const fetchMetadata = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                api.get('blog/admin/categories/'),
                api.get('blog/admin/tags/')
            ]);
            setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.results || []));
            setTags(Array.isArray(tagRes.data) ? tagRes.data : (tagRes.data?.results || []));
        } catch (error) {
            console.error("Failed to load metadata", error);
            toast({
                title: 'Could not load categories or tags',
                description: error.response?.data?.detail || 'Check that you are signed in as admin.',
                status: 'warning',
            });
        }
    };

    const tagOptions = useMemo(
        () => tags.map(t => ({ label: t.name, value: t.id })),
        [tags]
    );

    const selectedTagOptions = useMemo(
        () => tagOptions.filter(o => formData.tag_ids.includes(o.value)),
        [tagOptions, formData.tag_ids]
    );

    const coverPreviewUrl = normalizeImageUrl(formData.cover_image_url);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        if (!isEdit && !formData.slug) {
            const autoSlug = slugifyLabel(val);
            setFormData(prev => ({ ...prev, title: val, slug: autoSlug }));
        } else {
            setFormData(prev => ({ ...prev, title: val }));
        }
    };

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            toast({ title: 'Enter a category name', status: 'warning' });
            return;
        }
        setCreatingCategory(true);
        try {
            const res = await api.post('blog/admin/categories/', { name });
            const created = res.data;
            setCategories(prev => [...prev, created]);
            setFormData(prev => ({ ...prev, category_id: created.id }));
            setNewCategoryName('');
            toast({ title: `Category "${created.name}" created`, status: 'success' });
        } catch (error) {
            toast({
                title: 'Could not create category',
                description: error.response?.data?.name?.[0] || error.response?.data?.detail || 'Please try again.',
                status: 'error',
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleCreateTag = async (inputValue) => {
        const name = inputValue.trim();
        if (!name) return null;
        try {
            const res = await api.post('blog/admin/tags/', { name });
            const created = res.data;
            setTags(prev => [...prev, created]);
            toast({ title: `Tag "${created.name}" created`, status: 'success', duration: 2000 });
            return { label: created.name, value: created.id };
        } catch (error) {
            toast({
                title: 'Could not create tag',
                description: error.response?.data?.name?.[0] || error.response?.data?.detail || 'Please try again.',
                status: 'error',
            });
            return null;
        }
    };

    const handleSave = async (nextStatus = formData.status) => {
        const contentHtml = editorRef.current?.getHTML?.() || formData.content || '';

        if (!formData.title.trim()) {
            toast({ title: 'Title is required', status: 'warning' });
            return;
        }
        if (!formData.slug.trim()) {
            toast({ title: 'URL slug is required', status: 'warning' });
            return;
        }
        if (!stripHtml(contentHtml)) {
            toast({ title: 'Content is required', description: 'Add some body text before saving.', status: 'warning' });
            return;
        }

        setLoading(true);
        try {
            const payload = buildPostPayload(
                { ...formData, status: nextStatus },
                coverPreviewUrl,
                contentHtml,
            );

            if (isEdit) {
                await api.patch(`blog/admin/posts/${initialData.slug}/`, payload);
                setFormData(prev => ({ ...prev, status: nextStatus, content: contentHtml }));
                toast({
                    title: nextStatus === 'published' ? 'Post published' : 'Draft saved',
                    status: 'success',
                    description: nextStatus === 'published'
                        ? 'Live on the public blog.'
                        : 'Draft saved. Use Publish when you are ready to go live.',
                });
            } else {
                await api.post('blog/admin/posts/', payload);
                toast({
                    title: nextStatus === 'published' ? 'Post published' : 'Draft saved',
                    status: 'success',
                    description: nextStatus === 'published'
                        ? 'Your post is on the public blog.'
                        : 'Draft saved. You can publish it from the blog list.',
                });
                router.push('/admin/blog');
            }
        } catch (error) {
            const data = error.response?.data;
            const description = typeof data === 'object' && data !== null
                ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ')
                : (data?.detail || 'Unknown error');
            toast({ title: 'Error saving post', description, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={8} maxW="7xl" mx="auto">
            <Flex align="center" mb={8} gap={4} flexWrap="wrap">
                <IconButton icon={<FiArrowLeft />} onClick={() => router.push('/admin/blog')} aria-label="Back" variant="ghost" />
                <Heading size="lg" color="gray.800">{isEdit ? 'Edit Post' : 'Create New Post'}</Heading>
                <Badge
                    ml={{ base: 0, md: 2 }}
                    colorScheme={formData.status === 'published' ? 'green' : 'orange'}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                >
                    {formData.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
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
                                    ref={editorRef}
                                    content={formData.content} 
                                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))} 
                                />
                            </FormControl>
                        </VStack>
                    </Box>

                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="md" mb={4}>SEO & Metadata</Heading>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Meta Title</FormLabel>
                                <Input value={formData.meta_title} onChange={e => setFormData(prev => ({ ...prev, meta_title: e.target.value }))} placeholder="Optimized title for search engines" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Meta Description</FormLabel>
                                <Textarea value={formData.meta_description} onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))} placeholder="Short description for search results" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Meta Keywords</FormLabel>
                                <Input value={formData.meta_keywords} onChange={e => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))} placeholder="therapy, anxiety, etc (comma separated)" />
                            </FormControl>
                        </VStack>
                    </Box>
                </VStack>

                <VStack spacing={6} w={{ base: 'full', lg: '350px' }} align="stretch">
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.100">
                        <Heading size="md" mb={4}>Publishing</Heading>
                        <VStack spacing={4} align="stretch">
                            <Box p={4} bg={formData.status === 'published' ? 'green.50' : 'orange.50'} borderRadius="lg" border="1px solid" borderColor={formData.status === 'published' ? 'green.100' : 'orange.100'}>
                                <Text fontSize="sm" color="gray.700" mb={3}>
                                    {formData.status === 'published'
                                        ? 'This post is live on the public blog.'
                                        : 'Drafts are only visible here in admin until you publish.'}
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    <Button
                                        variant="outline"
                                        leftIcon={<FiSave />}
                                        onClick={() => handleSave('draft')}
                                        isLoading={loading}
                                    >
                                        Save Draft
                                    </Button>
                                    <Button
                                        colorScheme="teal"
                                        leftIcon={<FiGlobe />}
                                        onClick={() => handleSave('published')}
                                        isLoading={loading}
                                    >
                                        {formData.status === 'published' ? 'Update Published Post' : 'Publish to Website'}
                                    </Button>
                                </VStack>
                            </Box>

                            <Divider />
                            <FormControl isRequired>
                                <FormLabel>URL Slug</FormLabel>
                                <Input value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} placeholder="e.g. my-first-post" />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Cover Image URL</FormLabel>
                                <Input
                                    value={formData.cover_image_url}
                                    onChange={e => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Use a direct image link (ending in .jpg, .png, or .webp).
                                </Text>
                                {coverPreviewUrl && !coverPreviewError && (
                                    <Box mt={3} borderRadius="md" overflow="hidden" h="150px" border="1px solid" borderColor="gray.200" bg="gray.50">
                                        <Box
                                            as="img"
                                            src={coverPreviewUrl}
                                            alt="Cover preview"
                                            w="100%"
                                            h="100%"
                                            objectFit="cover"
                                            referrerPolicy="no-referrer"
                                            display="block"
                                            onError={() => setCoverPreviewError(true)}
                                        />
                                    </Box>
                                )}
                                {coverPreviewUrl && coverPreviewError && (
                                    <Text fontSize="xs" color="orange.600" mt={2}>
                                        Preview could not load this URL. Some hosts block hotlinking — the image may still work on the live blog if the link is valid.
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    value={formData.category_id || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                                    placeholder={categories.length ? 'Select category' : 'No categories yet — create one below'}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>
                                <HStack mt={3}>
                                    <Input
                                        size="sm"
                                        placeholder="New category name"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                                    />
                                    <Button
                                        size="sm"
                                        leftIcon={<FiPlus />}
                                        colorScheme="teal"
                                        variant="outline"
                                        onClick={handleCreateCategory}
                                        isLoading={creatingCategory}
                                        flexShrink={0}
                                    >
                                        Add
                                    </Button>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Tags</FormLabel>
                                <CreatableSelect
                                    isMulti
                                    chakraStyles={{
                                        container: (provided) => ({ ...provided, width: '100%' }),
                                    }}
                                    placeholder="Select or type to create tags..."
                                    options={tagOptions}
                                    value={selectedTagOptions}
                                    onChange={(selected) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            tag_ids: (selected || []).map(option => option.value),
                                        }));
                                    }}
                                    onCreateOption={async (inputValue) => {
                                        const created = await handleCreateTag(inputValue);
                                        if (!created) return;
                                        setFormData(prev => ({
                                            ...prev,
                                            tag_ids: [...prev.tag_ids, created.value],
                                        }));
                                    }}
                                    formatCreateLabel={(inputValue) => `Create tag "${inputValue}"`}
                                />
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                    Type a name and press Enter to create a new tag.
                                </Text>
                            </FormControl>
                        </VStack>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
}
