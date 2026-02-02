import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const SummarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
});

const parser = StructuredOutputParser.fromZodSchema(SummarySchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    [
      'You are a concise summarizer.',
      'Return ONLY valid JSON with fields: title, summary, bullets, confidence.',
      '- summary: 1-3 sentences',
      '- bullets: 2-5 key points',
      '- No markdown, no extra text',
    ].join('\n'),
  ],
  [
    'user',
    [
      'Summarize the following text in TL;DR style.',
      '{format_instructions}',
      'Text:',
      '"""',
      '{text}',
      '"""',
    ].join('\n'),
  ],
]);

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY is not set' },
        { status: 503 }
      );
    }

    let body: { text?: unknown };
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

    const text = rawText.slice(0, 12000);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4o-mini',
      temperature: 0.2,
    });

    const chain = prompt.pipe(model).pipe(parser);
    const result = await chain.invoke({
      text,
      format_instructions: parser.getFormatInstructions(),
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('TL;DR summary error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
