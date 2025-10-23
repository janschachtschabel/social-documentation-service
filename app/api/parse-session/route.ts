import { NextRequest, NextResponse } from 'next/server';
import { parseSessionTranscript } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { transcript, existingData } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript ist erforderlich' },
        { status: 400 }
      );
    }

    const parsed = await parseSessionTranscript(transcript, existingData);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error parsing session:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Parsen der Sitzung' },
      { status: 500 }
    );
  }
}
