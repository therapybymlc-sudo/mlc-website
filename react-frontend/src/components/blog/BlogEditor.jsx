'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Box, Flex, VStack, HStack, FormControl, FormLabel, Input, Button, 
    Textarea, useToast, Heading, IconButton, Text, Badge, Divider, Icon,
    Wrap, Center
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiPlus, FiGlobe, FiImage, FiTag, FiCheckCircle, FiX, FiChevronDown } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { CreatableSelect } from 'chakra-react-select';
import RichTextEditor from './RichTextEditor';
import ModernSelect from '../ModernSelect.jsx';
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

    const availableSuggestions = useMemo(
        () => tagOptions.filter(o => !formData.tag_ids.includes(o.value)).slice(0, 5),
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
        <Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>
            {/* Top Navigation Bar */}
            <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={3}>
                <HStack spacing={3}>
                    <IconButton 
                        icon={<FiArrowLeft />} 
                        onClick={() => router.push('/admin/blog')} 
                        aria-label="Back to articles" 
                        variant="outline"
                        borderRadius="full"
                        borderColor="rgba(86, 117, 109, 0.25)"
                        color="#263A33"
                        size="sm"
                        _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                    />
                    <Heading size="md" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600">
                        {isEdit ? 'Edit Editorial Article' : 'Draft New Article'}
                    </Heading>
                    <Badge
                        bg={formData.status === 'published' ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)"}
                        color={formData.status === 'published' ? "#059669" : "#D97706"}
                        fontSize="10.5px"
                        fontWeight="700"
                        borderRadius="full"
                        px={3}
                        py={0.5}
                    >
                        {formData.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                    </Badge>
                </HStack>

                <HStack spacing={2.5}>
                    <Button
                        variant="outline"
                        borderRadius="full"
                        borderColor="rgba(86, 117, 109, 0.3)"
                        color="#263A33"
                        fontSize="12.5px"
                        fontWeight="600"
                        h="36px"
                        px={4}
                        leftIcon={<FiSave />}
                        onClick={() => handleSave('draft')}
                        isLoading={loading}
                        _hover={{ bg: "rgba(86, 117, 109, 0.06)" }}
                    >
                        Save Draft
                    </Button>
                    <Button
                        bg="#56756D"
                        color="white"
                        borderRadius="full"
                        fontSize="12.5px"
                        fontWeight="600"
                        h="36px"
                        px={5}
                        leftIcon={<FiGlobe />}
                        onClick={() => handleSave('published')}
                        isLoading={loading}
                        boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"
                        _hover={{ bg: "#263A33" }}
                    >
                        {formData.status === 'published' ? 'Update Published' : 'Publish Article'}
                    </Button>
                </HStack>
            </Flex>

            {/* Editor Bento Layout */}
            <Flex gap={6} direction={{ base: 'column', lg: 'row' }} align="flex-start">
                {/* Main Article Body Column */}
                <VStack spacing={6} flex="1" align="stretch" w="full">
                    <Box 
                        bg="white" 
                        p={{ base: 5, md: 6 }} 
                        borderRadius="2xl" 
                        border="1px solid rgba(86, 117, 109, 0.14)" 
                        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                    >                        <VStack spacing={5} align="stretch">
                            <FormControl isRequired>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Article Title
                                </FormLabel>
                                <Input 
                                    h="46px"
                                    fontFamily="'Outfit', var(--font-outfit), sans-serif"
                                    fontSize="17px" 
                                    fontWeight="600" 
                                    color="#263A33" 
                                    borderRadius="xl"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    placeholder="Enter a descriptive, thoughtful article title..."
                                    value={formData.title} 
                                    onChange={handleTitleChange} 
                                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Editorial Content
                                </FormLabel>
                                <RichTextEditor 
                                    ref={editorRef}
                                    content={formData.content} 
                                    onChange={(html) => setFormData(prev => ({ ...prev, content: html }))} 
                                />
                            </FormControl>
                        </VStack>
                    </Box>

                    {/* SEO & Discoverability Card */}
                    <Box 
                        bg="white" 
                        p={{ base: 5, md: 6 }} 
                        borderRadius="2xl" 
                        border="1px solid rgba(86, 117, 109, 0.14)" 
                        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                    >
                        <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mb={1}>
                            Search Engine Metadata & Schema
                        </Heading>
                        <Text fontSize="12.5px" color="#5A6E65" mb={4} fontFamily="'Inter', var(--font-inter), sans-serif">
                            Customize how this article renders in search engine indexes and social share links
                        </Text>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Meta Title (SERP Tag)
                                </FormLabel>
                                <Input 
                                    h="38px"
                                    borderRadius="xl"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    fontSize="13px"
                                    fontFamily="'Inter', var(--font-inter), sans-serif"
                                    value={formData.meta_title} 
                                    onChange={e => setFormData(prev => ({ ...prev, meta_title: e.target.value }))} 
                                    placeholder="Optimized title tag (max 60 characters)" 
                                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Meta Description
                                </FormLabel>
                                <Textarea 
                                    borderRadius="xl"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    fontSize="13px"
                                    fontFamily="'Inter', var(--font-inter), sans-serif"
                                    minH="75px"
                                    value={formData.meta_description} 
                                    onChange={e => setFormData(prev => ({ ...prev, meta_description: e.target.value }))} 
                                    placeholder="Brief, compelling overview for search result snippets" 
                                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Meta Keywords
                                </FormLabel>
                                <Input 
                                    h="38px"
                                    borderRadius="xl"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    fontSize="13px"
                                    fontFamily="'Inter', var(--font-inter), sans-serif"
                                    value={formData.meta_keywords} 
                                    onChange={e => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))} 
                                    placeholder="therapy, trauma recovery, mental health (comma separated)" 
                                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                />
                            </FormControl>
                        </VStack>
                    </Box>
                </VStack>

                {/* Right Settings Sidebar */}
                <VStack spacing={6} w={{ base: 'full', lg: '340px' }} align="stretch" flexShrink={0}>
                    <Box 
                        bg="white" 
                        p={{ base: 5, md: 6 }} 
                        borderRadius="2xl" 
                        border="1px solid rgba(86, 117, 109, 0.14)" 
                        boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"
                    >
                        <Heading size="sm" color="#263A33" fontFamily="'Outfit', var(--font-outfit), sans-serif" fontWeight="600" mb={4}>
                            Publishing State
                        </Heading>
                        <VStack spacing={4} align="stretch">
                            <Box 
                                p={3.5} 
                                bg={formData.status === 'published' ? "rgba(236, 253, 245, 0.7)" : "rgba(254, 243, 199, 0.6)"} 
                                borderRadius="xl" 
                                border="1px solid" 
                                borderColor={formData.status === 'published' ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}
                            >
                                <Text fontSize="12.5px" color={formData.status === 'published' ? "#065F46" : "#92400E"} lineHeight="1.5">
                                    {formData.status === 'published'
                                        ? 'This article is live and indexed across the MLC publication hub.'
                                        : 'Draft mode: Only visible to authenticated administrators.'}
                                </Text>
                            </Box>

                            <Divider borderColor="rgba(86, 117, 109, 0.12)" />

                            <FormControl isRequired>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    URL Slug
                                </FormLabel>
                                <Input 
                                    h="38px"
                                    borderRadius="xl"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    fontSize="13px"
                                    fontFamily="'Inter', var(--font-inter), sans-serif"
                                    value={formData.slug} 
                                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} 
                                    placeholder="e.g. mindfulness-daily-practice" 
                                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Cover Photo URL
                                </FormLabel>
                                <Input
                                    h="38px"
                                    borderRadius="xl"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    fontSize="13px"
                                    fontFamily="'Inter', var(--font-inter), sans-serif"
                                    value={formData.cover_image_url}
                                    onChange={e => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                                    placeholder="https://images.unsplash.com/..."
                                    _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                />
                                <Text fontSize="11px" color="#5A6E65" mt={1} fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Direct image URL (.jpg, .png, or .webp).
                                </Text>
                                {coverPreviewUrl && !coverPreviewError && (
                                    <Box mt={3} borderRadius="xl" overflow="hidden" h="140px" border="1px solid rgba(86, 117, 109, 0.15)" bg="rgba(250, 248, 245, 0.85)">
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
                                    <Text fontSize="11.5px" color="#DC2626" mt={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">
                                        Could not render this URL preview.
                                    </Text>
                                )}
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Topic Category
                                </FormLabel>
                                <ModernSelect
                                    h="38px"
                                    value={formData.category_id || ''}
                                    onChange={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                                    placeholder={categories.length ? 'Select category' : 'No categories yet'}
                                    options={categories.map(c => ({
                                        value: c.id,
                                        label: c.name,
                                    }))}
                                />
                                <HStack mt={2.5} spacing={2}>
                                    <Input
                                        h="34px"
                                        fontSize="12px"
                                        fontFamily="'Inter', var(--font-inter), sans-serif"
                                        placeholder="New category name"
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                                        borderRadius="lg"
                                        borderColor="rgba(86, 117, 109, 0.2)"
                                        _focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                    />
                                    <Button
                                        size="sm"
                                        h="34px"
                                        leftIcon={<FiPlus />}
                                        variant="outline"
                                        borderRadius="full"
                                        borderColor="rgba(86, 117, 109, 0.25)"
                                        color="#56756D"
                                        fontSize="12px"
                                        fontWeight="600"
                                        fontFamily="'Inter', var(--font-inter), sans-serif"
                                        onClick={handleCreateCategory}
                                        isLoading={creatingCategory}
                                        flexShrink={0}
                                        _hover={{ bg: "rgba(86, 117, 109, 0.08)" }}
                                    >
                                        Add
                                    </Button>
                                </HStack>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="12.5px" fontWeight="600" color="#263A33" fontFamily="'Inter', var(--font-inter), sans-serif" mb={1.5}>
                                    Article Tags
                                </FormLabel>
                                
                                <Box
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="rgba(86, 117, 109, 0.2)"
                                    bg="white"
                                    p={2.5}
                                    transition="all 0.2s ease"
                                    _focusWithin={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}
                                >
                                    {/* Clean search & creation field */}
                                    <CreatableSelect
                                        size="sm"
                                        isMulti
                                        controlShouldRenderValue={false}
                                        closeMenuOnSelect={false}
                                        focusBorderColor="transparent"
                                        selectedOptionStyle="check"
                                        components={{
                                            ClearIndicator: (props) => (
                                                <Box
                                                    {...props.innerProps}
                                                    role="button"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    cursor="pointer"
                                                    p="2px 3px"
                                                    color="#718096"
                                                    transition="color 0.15s ease"
                                                    _hover={{ color: '#DC2626' }}
                                                    title="Clear selected tags"
                                                >
                                                    <Icon as={FiX} boxSize="11px" />
                                                </Box>
                                            ),
                                            DropdownIndicator: (props) => (
                                                <Box
                                                    {...props.innerProps}
                                                    role="button"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    cursor="pointer"
                                                    p="2px 4px 2px 2px"
                                                    color="#56756D"
                                                    transition="color 0.15s ease"
                                                    _hover={{ color: '#263A33' }}
                                                >
                                                    <Icon as={FiChevronDown} boxSize="12px" />
                                                </Box>
                                            ),
                                        }}
                                        chakraStyles={{
                                            container: (provided) => ({
                                                ...provided,
                                                width: '100%',
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                            }),
                                            control: (provided) => ({
                                                ...provided,
                                                border: 'none',
                                                boxShadow: 'none',
                                                minHeight: '34px',
                                                height: '34px',
                                                bg: 'rgba(250, 248, 245, 0.85)',
                                                borderRadius: 'lg',
                                                px: '4px',
                                                fontSize: '12.5px',
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                                _hover: { bg: 'white' },
                                            }),
                                            valueContainer: (provided) => ({
                                                ...provided,
                                                padding: '0 6px',
                                                minHeight: '34px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexWrap: 'nowrap',
                                            }),
                                            input: (provided) => ({
                                                ...provided,
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                                fontSize: '12px',
                                                color: '#263A33',
                                                margin: 0,
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                                fontSize: '12px',
                                                color: '#718096',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%',
                                            }),
                                            indicatorsContainer: (provided) => ({
                                                ...provided,
                                                height: '34px',
                                                bg: 'transparent',
                                                alignItems: 'center',
                                                paddingRight: '2px',
                                            }),
                                            dropdownIndicator: (provided) => ({
                                                ...provided,
                                                color: '#56756D',
                                                p: '0 3px',
                                                bg: 'transparent',
                                                '& svg': {
                                                    width: '12px !important',
                                                    height: '12px !important',
                                                },
                                                _hover: { color: '#263A33' },
                                            }),
                                            clearIndicator: (provided) => ({
                                                ...provided,
                                                color: '#718096',
                                                p: '0 2px',
                                                bg: 'transparent',
                                                cursor: 'pointer',
                                                '& svg': {
                                                    width: '11px !important',
                                                    height: '11px !important',
                                                },
                                                _hover: { color: '#DC2626' },
                                            }),
                                            indicatorSeparator: () => ({
                                                display: 'none',
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1600,
                                                my: 1.5,
                                                borderRadius: '14px',
                                                boxShadow: '0 14px 34px -4px rgba(38, 58, 51, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)',
                                                border: '1px solid rgba(86, 117, 109, 0.16)',
                                                bg: 'white',
                                                overflow: 'hidden',
                                            }),
                                            menuList: (provided) => ({
                                                ...provided,
                                                p: '6px',
                                                borderRadius: '14px',
                                                bg: 'white',
                                                border: 'none',
                                                boxShadow: 'none',
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                                maxHeight: '200px',
                                            }),
                                            option: (provided, { isFocused, isSelected }) => ({
                                                ...provided,
                                                borderRadius: '8px',
                                                px: '10px',
                                                py: '6px',
                                                my: '1px',
                                                fontSize: '12.5px',
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                                fontWeight: isSelected ? '600' : '500',
                                                color: isSelected ? '#263A33' : '#3D544C',
                                                bg: isSelected
                                                    ? 'rgba(86, 117, 109, 0.12)'
                                                    : isFocused
                                                    ? 'rgba(86, 117, 109, 0.08)'
                                                    : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                _hover: {
                                                    bg: 'rgba(86, 117, 109, 0.08)',
                                                    color: '#263A33',
                                                },
                                            }),
                                            noOptionsMessage: (provided) => ({
                                                ...provided,
                                                fontFamily: "'Inter', var(--font-inter), sans-serif",
                                                fontSize: '12px',
                                                color: '#718096',
                                                py: '10px',
                                            }),
                                        }}
                                        placeholder="Search or add tags..."
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
                                        formatCreateLabel={(inputValue) => `+ Create "${inputValue}"`}
                                    />

                                    {/* Packed Selected Tags Tray */}
                                    {selectedTagOptions.length > 0 && (
                                        <Box mt={2.5} pt={2.5} borderTop="1px solid rgba(86, 117, 109, 0.12)">
                                            <HStack justify="space-between" align="center" mb={2}>
                                                <HStack spacing={1.5}>
                                                    <Icon as={FiTag} boxSize="11px" color="#56756D" />
                                                    <Text fontSize="10.5px" fontWeight="700" color="#56756D" textTransform="uppercase" letterSpacing="0.08em">
                                                        Selected ({selectedTagOptions.length})
                                                    </Text>
                                                </HStack>
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    color="#718096"
                                                    _hover={{ color: "#DC2626", bg: "rgba(239, 68, 68, 0.08)" }}
                                                    h="18px"
                                                    px={1.5}
                                                    fontSize="10.5px"
                                                    fontWeight="600"
                                                    onClick={() => setFormData(prev => ({ ...prev, tag_ids: [] }))}
                                                >
                                                    Clear all
                                                </Button>
                                            </HStack>
                                            <Wrap spacing={1.5} align="center">
                                                {selectedTagOptions.map(option => (
                                                    <HStack
                                                        key={option.value}
                                                        spacing={1}
                                                        bg="rgba(86, 117, 109, 0.08)"
                                                        border="1px solid rgba(86, 117, 109, 0.22)"
                                                        borderRadius="full"
                                                        pl={2.5}
                                                        pr={1.5}
                                                        py="3px"
                                                        maxW="100%"
                                                        transition="all 0.15s ease"
                                                        _hover={{ bg: "rgba(86, 117, 109, 0.12)", borderColor: "#56756D" }}
                                                    >
                                                        <Text
                                                            fontSize="11.5px"
                                                            fontWeight="500"
                                                            color="#263A33"
                                                            fontFamily="'Inter', var(--font-inter), sans-serif"
                                                            whiteSpace="nowrap"
                                                            overflow="hidden"
                                                            textOverflow="ellipsis"
                                                            maxW={{ base: "170px", sm: "200px" }}
                                                            title={option.label}
                                                        >
                                                            {option.label}
                                                        </Text>
                                                        <Center
                                                            as="button"
                                                            type="button"
                                                            aria-label={`Remove tag ${option.label}`}
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    tag_ids: prev.tag_ids.filter(id => id !== option.value),
                                                                }));
                                                            }}
                                                            boxSize="15px"
                                                            borderRadius="full"
                                                            color="#56756D"
                                                            flexShrink={0}
                                                            transition="all 0.15s ease"
                                                            _hover={{ bg: "rgba(239, 68, 68, 0.15)", color: "#DC2626" }}
                                                        >
                                                            <Icon as={FiX} boxSize="10px" />
                                                        </Center>
                                                    </HStack>
                                                ))}
                                            </Wrap>
                                        </Box>
                                    )}

                                    {/* Quick suggestions when available */}
                                    {availableSuggestions.length > 0 && (
                                        <Box mt={selectedTagOptions.length > 0 ? 2 : 2.5} pt={selectedTagOptions.length > 0 ? 2 : 0} borderTop={selectedTagOptions.length > 0 ? "1px dashed rgba(86, 117, 109, 0.1)" : "none"}>
                                            <HStack spacing={1.5} mb={1.5}>
                                                <Text fontSize="10.5px" fontWeight="600" color="#718096" textTransform="uppercase" letterSpacing="0.06em">
                                                    Suggested
                                                </Text>
                                            </HStack>
                                            <Wrap spacing={1} align="center">
                                                {availableSuggestions.map(option => (
                                                    <Button
                                                        key={option.value}
                                                        size="xs"
                                                        h="22px"
                                                        px={2}
                                                        fontSize="11px"
                                                        fontWeight="500"
                                                        variant="outline"
                                                        borderRadius="full"
                                                        borderColor="rgba(86, 117, 109, 0.2)"
                                                        color="#56756D"
                                                        bg="transparent"
                                                        _hover={{ bg: "rgba(86, 117, 109, 0.08)", borderColor: "#56756D", color: "#263A33" }}
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                tag_ids: [...prev.tag_ids, option.value],
                                                            }));
                                                        }}
                                                    >
                                                        + {option.label}
                                                    </Button>
                                                ))}
                                            </Wrap>
                                        </Box>
                                    )}
                                </Box>
                                <Text fontSize="11px" color="#5A6E65" mt={1.5} fontFamily="'Inter', var(--font-inter), sans-serif">
                                    Press Enter after typing to instantiate custom taxonomy tags.
                                </Text>
                            </FormControl>
                        </VStack>
                    </Box>
                </VStack>
            </Flex>
        </Box>
    );
}
