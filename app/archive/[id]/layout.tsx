import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch archive data for metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/archive/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return {
        title: 'Archive Not Found',
        description: 'The requested archive could not be found.'
      };
    }

    const data = await response.json();
    const archive = data.archive;

    const title = `${archive.title} | My Blog`;
    const description = archive.content.substring(0, 160) || 'Check out my blog post';
    const image = archive.imageUrl || '/default-og-image.jpg';
    const url = `${baseUrl}/archive/${id}`;

    // Add rating to description if available
    const ratingText = archive.rating ? ` | 평점: ${'⭐'.repeat(archive.rating)}` : '';
    const fullDescription = description + ratingText;

    return {
      title,
      description: fullDescription,
      openGraph: {
        title,
        description: fullDescription,
        url,
        siteName: 'My Blog',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: archive.title,
          },
        ],
        locale: 'ko_KR',
        type: 'article',
        publishedTime: archive.createdAt,
        tags: archive.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: fullDescription,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'My Blog',
      description: 'View my blog archive'
    };
  }
}

export default function ArchiveDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
