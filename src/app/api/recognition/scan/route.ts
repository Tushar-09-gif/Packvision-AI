import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireAuth(['admin', 'worker']); // Allow both roles to scan
    
    // Check for API key (allow either NEXT_PUBLIC_ or standard)
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'AI recognition failed: API key missing. Please configure GEMINI_API_KEY in your environment variables.' 
      }, { status: 400 });
    }

    const { base64Image } = await req.json();
    
    if (!base64Image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    // Get products for context
    const db = await getDb();
    const products = await db.getProducts();
    const productList = products.map((p: any) => `ID: ${p.id}, Name: ${p.name}, Code: ${p.code}`).join('\n');
    
    const prompt = `You are a product recognition AI. I will provide an image of a product and a list of known products. 
Identify the product from the list that best matches the image.
Return ONLY a JSON object with the exact format: {"id": "matched_id", "confidence": 95}
If no product matches, return {"id": null, "confidence": 0}

Known products:
${productList}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
          ]
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ success: false, error: `API error (${response.status}): ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    let aiResult;
    try {
      aiResult = JSON.parse(rawText || '{}');
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid response format from AI" }, { status: 500 });
    }

    return NextResponse.json({ success: true, aiResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
