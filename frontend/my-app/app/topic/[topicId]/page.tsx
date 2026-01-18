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
    title: `${title} Practice Questions | Free NEET & JEE Quiz | Class 11 & 12 Important MCQs`,
    description: `Free ${title} practice questions and quizzes for NEET, JEE & Medical Entrance. Chapter-wise important questions for Class 11 & 12 CBSE & State Board. AI-powered mock tests.`,
    keywords: [
      title,
      `${title} neet questions`,
      `${title} mcq`,
      `${title} class 11`,
      `${title} class 12`,
      `${title} jee questions`,
      "neet practice",
      "free quiz",
      "medical entrance"
    ],
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://medcrack.in'}/topic/${topicId}`,
    },
    openGraph: {
      title: `${title} Practice Questions | Free NEET & JEE Quiz`,
      description: `Attempt ${title} quizzes designed for NEET & JEE aspirants. Free and AI-powered.`,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://medcrack.in'}/topic/${topicId}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} Practice Questions | MedCrack`,
      description: `Master ${title} for NEET & JEE with MedCrack's free quizzes.`,
    },
  }
}

export default async function TopicPage({ params }: Props) {
  const { topicId } = await params;
  return <TopContent topicId={topicId} />;
}
