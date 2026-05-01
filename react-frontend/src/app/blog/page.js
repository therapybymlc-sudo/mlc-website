import BlogListClient from './BlogListClient';
import { Box } from '@chakra-ui/react';

// Revalidate every hour
export const revalidate = 3600;

export const metadata = {
    title: 'Blog | MLC Health & Wellness Centre',
    description: 'Explore clinical insights, mental health resources, and stories from our verified practitioners at MLC.',
};

async function fetchInitialData() {
    try {
        // We use absolute URL for server-side fetch if possible, but since we are in Next.js app router
        // and we might not know the exact domain, it's safer to fetch via the internal API or direct DB call if possible.
        // However, standard Next.js approach is to use the full URL.
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        
        const [postsRes, metaRes] = await Promise.all([
            fetch(`${baseUrl}/api/blog/public/posts/`, { next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/api/blog/public/posts/meta_data/`, { next: { revalidate: 3600 } })
        ]);
        
        const posts = postsRes.ok ? await postsRes.json() : [];
        const meta = metaRes.ok ? await metaRes.json() : { categories: [], tags: [] };
        
        return { posts, categories: meta.categories, tags: meta.tags };
    } catch (e) {
        console.error("Server-side fetch error", e);
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
