'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Center, Spinner, useToast } from '@chakra-ui/react';
import BlogEditor from '../../../../components/blog/BlogEditor';
import api from '../../../../api';

export default function EditBlogPage() {
    const params = useParams();
    const toast = useToast();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.slug) fetchPost();
    }, [params.slug]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/api/blog/admin/posts/${params.slug}/`);
            setPost(res.data);
        } catch (error) {
            toast({ title: 'Failed to load post', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Center h="80vh"><Spinner size="xl" color="teal.500" /></Center>;
    if (!post) return <Center h="80vh">Post not found</Center>;

    return <BlogEditor isEdit={true} initialData={post} />;
}
