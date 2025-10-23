import { NextRequest, NextResponse } from 'next/server';
import { parseClientProfile } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript ist erforderlich' },
        { status: 400 }
      );
    }

    const parsed = await parseClientProfile(transcript);

    if (!parsed.name) {
      return NextResponse.json(
        { error: 'Name konnte nicht extrahiert werden' },
        { status: 400 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error parsing client profile:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Parsen des Klientenprofils' },
      { status: 500 }
    );
  }
}
