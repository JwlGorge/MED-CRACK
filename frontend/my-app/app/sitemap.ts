import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://med-cracker.com';

    // These should ideally be fetched from your backend if dynamic
    const topics = ['biology', 'physics', 'chemistry', 'zoology', 'botany'];

    const topicUrls = topics.map((topic) => ({
        url: `${baseUrl}/topic/${topic}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/auth`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...topicUrls,
    ]
}
