import TopContent from "@/components/topic-content";
import { Metadata } from 'next';

type Props = {
  params: Promise<{ topicId: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { topicId } = await params;

  // Clean up the topic name for display (e.g. "biology" -> "Biology")
  const title = topicId.charAt(0).toUpperCase() + topicId.slice(1);

  return {
    title: `${title} Questions for NEET | Med-Cracker`,
    description: `Practice top-tier ${title} questions for the NEET medical entrance exam. Free quizzes, progress tracking, and detailed solutions.`,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://medcrack.in'}/topic/${topicId}`,
    },
    openGraph: {
      title: `${title} Practice Questions | Med-Cracker`,
      description: `Attempt ${title} quizzes designed for NEET aspirants.`,
    },
  }
}

export default async function TopicPage({ params }: Props) {
  const { topicId } = await params;
  return <TopContent topicId={topicId} />;
}
