import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { reportType, clientName, sessions, profileData } = await request.json();

    if (!reportType || !clientName) {
      return NextResponse.json(
        { error: 'Report-Typ und Klientenname sind erforderlich' },
        { status: 400 }
      );
    }

    const content = await generateReport(reportType, clientName, sessions, profileData);

    const title = 
      reportType === 'anamnese' 
        ? `Anamnese - ${clientName}`
        : reportType === 'interim'
        ? `Zwischenbericht - ${clientName}`
        : `Abschlussbericht - ${clientName}`;

    return NextResponse.json({ title, content });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Generieren des Berichts' },
      { status: 500 }
    );
  }
}
