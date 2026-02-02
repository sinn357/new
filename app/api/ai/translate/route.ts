import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const TranslationSchema = z.object({
  translation: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(TranslationSchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    [
      'You are a professional translator.',
      'Preserve any existing HTML tags, attributes, and entities exactly as-is.',
      'Return ONLY valid JSON with the field: translation.',
      '- Do not add explanations or extra text.',
    ].join('\n'),
  ],
  [
    'user',
    [
      'Translate the following content into {targetLanguage}.',
      '{format_instructions}',
      'Content:',
      '"""',
      '{text}',
      '"""',
    ].join('\n'),
  ],
]);

const TARGET_LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY is not set' },
        { status: 503 }
      );
    }

    let body: { text?: unknown; target?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    const rawText = typeof body.text === 'string' ? body.text.trim() : '';
    if (!rawText) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    const target = typeof body.target === 'string' ? body.target.trim().toLowerCase() : 'en';
    if (!TARGET_LANGUAGE_LABELS[target]) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only English translation is supported right now.',
          supported: Object.keys(TARGET_LANGUAGE_LABELS),
        },
        { status: 400 }
      );
    }

    const text = rawText.slice(0, 12000);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.2,
    });

    const chain = prompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
      text,
      targetLanguage: TARGET_LANGUAGE_LABELS[target],
      format_instructions: parser.getFormatInstructions(),
    });

    return NextResponse.json({ success: true, data: { ...result, target } });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate translation' },
      { status: 500 }
    );
  }
}
