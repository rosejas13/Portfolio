import BlogPost from '@/features/blog/blog-post'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BlogPost slug={slug} />
}
