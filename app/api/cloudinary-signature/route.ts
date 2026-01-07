import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary 설정
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const hasCloudinary = cloudName && apiKey && apiSecret &&
                     cloudName !== 'your_cloud_name' &&
                     apiKey !== 'your_api_key' &&
                     apiSecret !== 'your_api_secret';

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(request: NextRequest) {
  try {
    if (!hasCloudinary) {
      return NextResponse.json({
        error: 'Cloudinary credentials not configured'
      }, { status: 500 });
    }

    const body = await request.json();
    const { paramsToSign } = body;

    // Cloudinary 서명 생성
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret as string
    );

    return NextResponse.json({
      signature,
      apiKey,
      cloudName,
      timestamp: paramsToSign.timestamp
    });

  } catch (error) {
    console.error('Signature generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate signature',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
