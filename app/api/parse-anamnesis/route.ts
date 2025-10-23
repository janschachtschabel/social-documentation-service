import { NextRequest, NextResponse } from 'next/server';
import { parseAnamnesis } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { transcript, existingData } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript ist erforderlich' },
        { status: 400 }
      );
    }

    // Parse mit optionalen bestehenden Daten (für UPDATE)
    const parsed = await parseAnamnesis(transcript, existingData);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error parsing anamnesis:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Parsen der Anamnese' },
      { status: 500 }
    );
  }
}
