import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://med-cracker.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/profile/', '/result/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
