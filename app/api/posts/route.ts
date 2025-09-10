import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ posts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body as { title?: unknown; content?: unknown };

    if (typeof title !== "string" || typeof content !== "string" || 
        title.trim() === "" || content.trim() === "") {
      return Response.json(
        { error: "Title and content must be non-empty strings" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({ 
      data: { title: title.trim(), content: content.trim() } 
    });
    return Response.json({ post }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}