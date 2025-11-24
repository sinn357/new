import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Check if we're in production or if Cloudinary is configured
const isProduction = process.env.NODE_ENV === 'production';
const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET &&
                     process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                     process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
                     process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

// Configure Cloudinary if available
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // File size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    // All file types are now allowed
    // Removed file type restrictions for maximum flexibility

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Cloudinary in production or when configured, otherwise use local storage
    if ((isProduction || hasCloudinary) && hasCloudinary) {
      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadOptions = {
          resource_type: 'auto' as const,
          folder: 'blog-web',
          public_id: `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          // Enable HEIC/HEIF support by allowing format transformation
          format: file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')
            ? 'jpg'
            : undefined,
        };

        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            }
            else resolve(result);
          }
        ).end(buffer);
      });

      const result = uploadResponse as {
        secure_url: string;
        public_id: string;
        [key: string]: unknown;
      };

      return NextResponse.json({ 
        message: 'File uploaded successfully to cloud',
        url: result.secure_url,
        publicId: result.public_id,
        fileName: file.name,
        size: file.size,
        type: file.type,
        storage: 'cloudinary'
      });
    } else {
      // Local file storage (development only)
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      const filePath = path.join(uploadDir, fileName);

      try {
        await writeFile(filePath, buffer);
      } catch {
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, buffer);
      }

      const fileUrl = `/uploads/${fileName}`;

      return NextResponse.json({ 
        message: 'File uploaded successfully to local storage',
        url: fileUrl,
        fileName: fileName,
        size: file.size,
        type: file.type,
        storage: 'local'
      });
    }

  } catch (error) {
    console.error('File upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to upload file',
      details: errorMessage
    }, { status: 500 });
  }
}