import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch work data for metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/work/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return {
        title: 'Work Not Found',
        description: 'The requested work could not be found.'
      };
    }

    const data = await response.json();
    const work = data.work;

    const title = `${work.title} | My Portfolio`;
    const description = work.content.substring(0, 160) || 'Check out my work';
    const image = work.imageUrl || '/default-og-image.jpg';
    const url = `${baseUrl}/work/${id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: 'My Portfolio',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: work.title,
          },
        ],
        locale: 'ko_KR',
        type: 'article',
        publishedTime: work.createdAt,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'My Portfolio',
      description: 'View my portfolio work'
    };
  }
}

export default function WorkDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
