import { isAdminAuthenticated } from '@/lib/auth';

export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated();
    
    return Response.json({ 
      isAuthenticated,
      message: isAuthenticated ? "Admin is authenticated" : "Admin not authenticated"
    });
  } catch (error) {
    console.error('Admin check error:', error);
    
    return Response.json(
      { 
        isAuthenticated: false, 
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}