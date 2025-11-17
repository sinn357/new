import { prisma } from "@/lib/db";
import { workSchema } from '@/lib/validations/work';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const work = await prisma.work.findUnique({
      where: { id }
    });

    if (!work) {
      return Response.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }

    return Response.json({ work });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return Response.json(
        { error: "Unauthorized - Admin authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Zod validation
    const validated = workSchema.safeParse(body);

    if (!validated.success) {
      console.log('Validation failed:', validated.error.format());
      return Response.json(
        {
          error: "Validation failed",
          details: validated.error.format()
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    const work = await prisma.work.findUnique({
      where: { id }
    });

    if (!work) {
      return Response.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }

    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        techStack: data.techStack, // Already array from Zod transform
        githubUrl: data.githubUrl || null,
        demoUrl: data.demoUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        instagramUrl: data.instagramUrl || null,
        imageUrl: data.imageUrl || null,
        fileUrl: data.fileUrl || null,
        status: data.status,
        duration: data.duration || null
      }
    });

    return Response.json({ work: updatedWork });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return Response.json(
        { error: "Unauthorized - Admin authentication required" },
        { status: 401 }
      );
    }

    const work = await prisma.work.findUnique({
      where: { id }
    });

    if (!work) {
      return Response.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }

    await prisma.work.delete({
      where: { id }
    });

    return Response.json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
