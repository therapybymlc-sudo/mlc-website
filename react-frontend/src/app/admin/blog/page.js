'use client';
import { useState, useEffect } from 'react';
import { 
    Box, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, 
    HStack, IconButton, useToast, Spinner, Center, Flex, Link as ChakraLink
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../../api';
import NextLink from 'next/link';
import { format } from 'date-fns';

export default function AdminBlogList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/api/blog/admin/posts/');
            setPosts(res.data);
        } catch (error) {
            toast({ title: 'Failed to load posts', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/api/blog/admin/posts/${slug}/`);
            toast({ title: 'Post deleted', status: 'success' });
            setPosts(posts.filter(p => p.slug !== slug));
        } catch (error) {
            toast({ title: 'Failed to delete post', status: 'error' });
        }
    };

    if (loading) return <Center h="60vh"><Spinner size="xl" color="teal.500" /></Center>;

    return (
        <Box p={8} maxW="7xl" mx="auto">
            <Flex justify="space-between" align="center" mb={8}>
                <Box>
                    <Heading size="lg" color="gray.800" mb={2}>Blog Posts</Heading>
                    <Text color="gray.600">Manage your MLC blog content and categories.</Text>
                </Box>
                <Button as={NextLink} href="/admin/blog/create" colorScheme="teal" leftIcon={<FiPlus />}>
                    New Post
                </Button>
            </Flex>

            <Box bg="white" borderRadius="lg" shadow="sm" overflowX="auto" border="1px solid" borderColor="gray.100">
                <Table variant="simple">
                    <Thead bg="gray.50">
                        <Tr>
                            <Th>Title</Th>
                            <Th>Status</Th>
                            <Th>Category</Th>
                            <Th>Date</Th>
                            <Th isNumeric>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {posts.map(post => (
                            <Tr key={post.id}>
                                <Td fontWeight="500">
                                    <ChakraLink as={NextLink} href={`/admin/blog/${post.slug}`} color="teal.600">
                                        {post.title}
                                    </ChakraLink>
                                </Td>
                                <Td>
                                    <Badge colorScheme={post.status === 'published' ? 'green' : 'orange'}>
                                        {post.status}
                                    </Badge>
                                </Td>
                                <Td>{post.category?.name || 'Uncategorized'}</Td>
                                <Td>{format(new Date(post.created_at), 'MMM dd, yyyy')}</Td>
                                <Td isNumeric>
                                    <HStack spacing={2} justify="flex-end">
                                        <IconButton 
                                            as={NextLink} href={`/admin/blog/${post.slug}`}
                                            icon={<FiEdit2 />} size="sm" variant="ghost" aria-label="Edit"
                                        />
                                        <IconButton 
                                            icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" aria-label="Delete"
                                            onClick={() => handleDelete(post.slug)}
                                        />
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                        {posts.length === 0 && (
                            <Tr><Td colSpan={5} textAlign="center" py={8} color="gray.500">No blog posts found.</Td></Tr>
                        )}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
}
