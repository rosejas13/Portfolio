import ProjectDetail from '@/features/projects/project-detail'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <ProjectDetail slug={slug} />
}
