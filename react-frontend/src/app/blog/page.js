import BlogListClient from './BlogListClient';
import { Box } from '@chakra-ui/react';
import { getPublicApiBase } from '../../lib/publicApiBase';

// Revalidate every minute so new publishes appear quickly on the public blog
export const revalidate = 60;

export const metadata = {
    title: 'Blog | MLC Health & Wellness Centre',
    description: 'Explore clinical insights, mental health resources, and stories from our verified practitioners at MLC.',
};

async function fetchInitialData() {
    try {
        const apiBase = getPublicApiBase();

        const [postsRes, metaRes] = await Promise.all([
            fetch(`${apiBase}/blog/public/posts/`, { next: { revalidate: 60 } }),
            fetch(`${apiBase}/blog/public/posts/meta_data/`, { next: { revalidate: 60 } })
        ]);
        
        const posts = postsRes.ok ? await postsRes.json() : [];
        const meta = metaRes.ok ? await metaRes.json() : { categories: [], tags: [] };
        
        return { posts, categories: meta.categories, tags: meta.tags };
    } catch (_e) {
        return { posts: [], categories: [], tags: [] };
    }
}

export default async function BlogPage() {
    const { posts, categories, tags } = await fetchInitialData();

    return (
        <Box minH="100vh" bg="#f7f6f2">
            <BlogListClient initialPosts={posts} categories={categories} tags={tags} />
        </Box>
    );
}
