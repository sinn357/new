import { prisma } from "@/lib/db";
import { archiveSchema } from '@/lib/validations/archive';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const archive = await prisma.archive.findUnique({
      where: { id }
    });

    if (!archive) {
      return Response.json(
        { error: "Archive not found" },
        { status: 404 }
      );
    }

    return Response.json({ archive });
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
    console.log('PUT /api/archive/[id] - Request body:', body);

    // Zod validation
    const validated = archiveSchema.safeParse(body);

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

    const archive = await prisma.archive.findUnique({
      where: { id }
    });

    if (!archive) {
      return Response.json(
        { error: "Archive not found" },
        { status: 404 }
      );
    }

    const updatedArchive = await prisma.archive.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags, // Already array from Zod transform
        imageUrl: data.imageUrl || null,
        fileUrl: data.fileUrl || null
      }
    });

    console.log('Archive updated successfully:', updatedArchive.id);
    return Response.json({ archive: updatedArchive });
  } catch (error) {
    console.error("PUT /api/archive/[id] error:", error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Failed to update archive", details: error instanceof Error ? error.message : 'Internal server error' },
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

    const archive = await prisma.archive.findUnique({
      where: { id }
    });

    if (!archive) {
      return Response.json(
        { error: "Archive not found" },
        { status: 404 }
      );
    }

    await prisma.archive.delete({
      where: { id }
    });

    return Response.json({ message: "Archive deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
