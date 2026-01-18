import type { Metadata } from "next";
import LandingPageContent from "@/components/landing-page-content";

export const metadata: Metadata = {
  title: "Free NEET & JEE Practice | Class 11 & 12 CBSE & State Board | MedCrack",
  description: "The #1 Free Platform for NEET, JEE & Medical Entrance Prep. Practice 50,000+ Questions for Class 11 & 12 Physics, Chemistry, Biology. CBSE & State Board Syllabus. AI-Generated Quizzes, Mock Tests & Previous Year Papers.",

  keywords: [
    // Core Exams
    "NEET", "JEE", "JEE Main", "KEAM", "Medical Entrance", "Medical Entrence", "Engineering Entrance",

    // Classes & Boards
    "Class 11", "Class 12", "CBSE", "State Board", "NCERT",

    // Practice & Content Types
    "Practice", "Quiz", "Free", "Mock Test", "Previous Year Questions", "PYQ", "MCQs",
    "NEET Practice Quiz Free", "Daily Practice Problems", "DPP",

    // Subjects
    "Physics", "Chemistry", "Biology", "Botany", "Zoology",

    // Specific Long-tail
    "neet physics question", "neet chemistry questions", "neet biology questions",
    "neet msqs", "AI NEET questions", "personalized neet prep",
    "weak area detection", "adaptive practice",

    // Brand
    "medcrack", "Med-Cracker"
  ],

  openGraph: {
    title: "Free NEET & JEE Practice | Class 11 & 12 | MedCrack",
    description: "Unlock your potential with MedCrack's AI-driven practice platform. Free Mock Tests, Infinite Quizzes, and Personalized Analytics for NEET, JEE & Board Exams.",
    type: "website",
    locale: "en_IN",
    siteName: "MedCrack",
    url: "https://medcrack.in",
  },

  twitter: {
    card: "summary_large_image",
    title: "MedCrack | #1 Free NEET & JEE Prep",
    description: "Ace your Medical & Engineering Exams with Free Daily Quizzes, AI Feedback & Weak Area Detection.",
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

  alternates: {
    canonical: "https://medcrack.in",
  },
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Educationalapplication",
    "name": "MedCrack",
    "alternateName": "Med-Cracker",
    "url": "https://medcrack.in",
    "description": "Premium AI-powered NEET & JEE preparation platform. Practice unlimited questions for free.",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "category": "Free"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student",
      "audienceType": "Medical Aspirants"
    },
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
