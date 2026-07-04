import { notFound } from 'next/navigation';
import { getPublicApiBase } from '../../../lib/publicApiBase';
import BlogPostClient from './BlogPostClient';

export const revalidate = 60;
export const dynamicParams = true;

async function getPost(slug) {
  if (!slug) return null;
  try {
    const apiBase = getPublicApiBase();
    const res = await fetch(`${apiBase}/blog/public/posts/${encodeURIComponent(slug)}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (_error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found | MLC' };

  return {
    title: `${post.meta_title || post.title} | MLC Health`,
    description: post.meta_description,
    keywords: post.meta_keywords,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return <BlogPostClient post={post} />;
}
