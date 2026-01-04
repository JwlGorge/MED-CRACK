import type { Metadata } from "next";
import LandingPageContent from "@/components/landing-page-content";

export const metadata: Metadata = {
  title: "NEET, JEE & KEAM Prep | Free Mock Tests & Previous Year Questions",
  description: "The #1 Platform for Medical & Engineering Entrance Exams. Practice 50,000+ Questions for NEET, JEE Main, KEAM. Featuring AI-generated questions and personalized weak area detection.",
  keywords: [
    "medcrack", "neet questions", "neet physics question", "neet chemistry questions",
    "neet msqs", "neet practice questions", "AI NEET questions", "personalized neet prep",
    "weak area detection", "adaptive practice", "NEET", "NEET 2026", "JEE Main", "KEAM",
    "Medical Entrance Exam", "Engineering Entrance", "Class 11 Physics Questions",
    "Class 12 Biology", "NEET Mock Test Free", "Previous Year Question Papers",
    "Biology MCQs", "Physics Formulae", "Competitive Exam Preparation"
  ],
  openGraph: {
    title: "Master NEET & JEE: Free Practice Platform",
    description: "Crack your entrance exams with our data-driven practice platform. Thousands of free questions for NEET, KEAM, and JEE aspirants.",
    type: "website",
    locale: "en_IN",
    siteName: "MedCrack"
  },
  twitter: {
    card: "summary_large_image",
    title: "MedCrack | Crack NEET & JEE",
    description: "Free daily practice for Medical and Engineering entrance exams.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "MedCrack",
    "alternateName": "Med-Cracker",
    "url": "https://medcrack.in",
    "description": "Premium NEET preparation platform with thousands of practice questions.",
    "sameAs": [
      "https://twitter.com/medcracker",
      "https://instagram.com/medcracker"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageContent />
    </>
  );
}
