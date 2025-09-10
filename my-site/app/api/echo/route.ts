export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || typeof body.text !== 'string' || body.text.trim() === '') {
      return Response.json(
        { error: 'Invalid request body. Expected { text: string }' },
        { status: 400 }
      );
    }
    
    return Response.json({ text: body.text });
  } catch {
    return Response.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}