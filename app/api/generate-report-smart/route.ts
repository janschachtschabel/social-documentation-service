import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { reportType, clientId, transcript, existingContent } = await request.json();

    if (!reportType || !clientId || !transcript) {
      return NextResponse.json(
        { error: 'reportType, clientId und transcript sind erforderlich' },
        { status: 400 }
      );
    }

    // Load ALL client data
    const { data: client } = await supabase
      .from('clients')
      .select('name, profile_data')
      .eq('id', clientId)
      .single();

    // Load all sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: true });

    // Load all existing reports
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });

    if (!client) {
      return NextResponse.json({ error: 'Klient nicht gefunden' }, { status: 404 });
    }

    // Build context
    const profileData = client.profile_data || {};
    const anamnesis = profileData.anamnesis || {};

    let contextPrompt = '';

    if (reportType === 'interim') {
      contextPrompt = `Du bist ein professioneller Sozialarbeiter. Erstelle einen **Zwischenbericht** basierend auf den bereitgestellten Daten.

**WICHTIGE KONTEXTDATEN:**

**Klientenprofil:**
- Name: ${client.name}
- Alter: ${profileData.age || 'k.A.'}
- Geschlecht: ${profileData.gender || 'k.A.'}
- Familienstand: ${profileData.maritalStatus || 'k.A.'}
- Kinder: ${profileData.children || 'k.A.'}
- Nationalität: ${profileData.nationality || 'k.A.'}
- Beruf: ${profileData.occupation || 'k.A.'}
- Beschäftigungsstatus: ${profileData.employmentStatus || 'k.A.'}

**Anamnese (Ausgangssituation):**
${anamnesis.housingSituation ? `- Wohnsituation: ${anamnesis.housingSituation}` : ''}
${anamnesis.financialSituation ? `- Finanzielle Situation: ${anamnesis.financialSituation}` : ''}
${anamnesis.familySituation ? `- Familiäre Situation: ${anamnesis.familySituation}` : ''}
${anamnesis.childrenSituation ? `- Situation der Kinder: ${anamnesis.childrenSituation}` : ''}
${anamnesis.goalsAndWishes ? `- Ziele und Wünsche: ${anamnesis.goalsAndWishes}` : ''}

**Bisherige Termine (${sessions?.length || 0} Termine):**
${sessions?.map((s, i) => `
Termin ${i + 1} (${new Date(s.session_date).toLocaleDateString('de-DE')}):
- Aktueller Stand: ${s.current_status}
- Aktionen: ${s.actions_taken}
- Nächste Schritte: ${s.next_steps}
${s.network_involvement ? `- Netzwerk: ${s.network_involvement}` : ''}
`).join('\n') || 'Keine Termine dokumentiert'}

**Bisherige Berichte:**
${reports?.map((r) => `- ${r.report_type} vom ${new Date(r.created_at).toLocaleDateString('de-DE')}: ${r.title}`).join('\n') || 'Keine Berichte vorhanden'}

${existingContent ? `
**Bestehender Berichtinhalt:**
${existingContent}

**WICHTIG:** Ergänze den bestehenden Inhalt mit den neuen Informationen. Überschreibe nichts, sondern füge hinzu.
` : ''}

**Neue Notiz/Ergänzung:**
${transcript}

**Aufgabe:**
Erstelle einen professionellen Zwischenbericht der:
1. Die Ausgangssituation kurz zusammenfasst
2. Den bisherigen Verlauf beschreibt
3. Erreichte Fortschritte hervorhebt
4. Aktuelle Herausforderungen benennt
5. Nächste Schritte und Empfehlungen gibt

Schreibe strukturiert, empathisch und professionell. Nutze alle verfügbaren Daten.`;
    } else if (reportType === 'final') {
      contextPrompt = `Du bist ein professioneller Sozialarbeiter. Erstelle einen **Abschlussbericht** basierend auf den bereitgestellten Daten.

**WICHTIGE KONTEXTDATEN:**

**Klientenprofil:**
- Name: ${client.name}
- Alter: ${profileData.age || 'k.A.'}
- Geschlecht: ${profileData.gender || 'k.A.'}
- Familienstand: ${profileData.maritalStatus || 'k.A.'}
- Kinder: ${profileData.children || 'k.A.'}
- Nationalität: ${profileData.nationality || 'k.A.'}
- Beruf: ${profileData.occupation || 'k.A.'}
- Beschäftigungsstatus: ${profileData.employmentStatus || 'k.A.'}

**Anamnese (Ausgangssituation):**
${anamnesis.housingSituation ? `- Wohnsituation: ${anamnesis.housingSituation}` : ''}
${anamnesis.financialSituation ? `- Finanzielle Situation: ${anamnesis.financialSituation}` : ''}
${anamnesis.familySituation ? `- Familiäre Situation: ${anamnesis.familySituation}` : ''}
${anamnesis.childrenSituation ? `- Situation der Kinder: ${anamnesis.childrenSituation}` : ''}
${anamnesis.goalsAndWishes ? `- Ziele und Wünsche: ${anamnesis.goalsAndWishes}` : ''}

**Gesamtverlauf (${sessions?.length || 0} Termine):**
${sessions?.map((s, i) => `
Termin ${i + 1} (${new Date(s.session_date).toLocaleDateString('de-DE')}):
- Aktueller Stand: ${s.current_status}
- Aktionen: ${s.actions_taken}
- Nächste Schritte: ${s.next_steps}
${s.network_involvement ? `- Netzwerk: ${s.network_involvement}` : ''}
`).join('\n') || 'Keine Termine dokumentiert'}

**Bisherige Berichte:**
${reports?.map((r) => `- ${r.report_type} vom ${new Date(r.created_at).toLocaleDateString('de-DE')}: ${r.title}`).join('\n') || 'Keine Berichte vorhanden'}

${existingContent ? `
**Bestehender Berichtinhalt:**
${existingContent}

**WICHTIG:** Ergänze den bestehenden Inhalt mit den neuen Informationen. Überschreibe nichts, sondern füge hinzu.
` : ''}

**Abschließende Notiz/Ergänzung:**
${transcript}

**Aufgabe:**
Erstelle einen professionellen Abschlussbericht der:
1. Die Ausgangssituation beschreibt
2. Den gesamten Betreuungsverlauf zusammenfasst
3. Erreichte Ziele und Fortschritte dokumentiert
4. Verbleibende Herausforderungen benennt
5. Eine Gesamtbewertung und Empfehlungen gibt
6. Ggf. Hinweise für Nachfolge-Maßnahmen enthält

Schreibe strukturiert, empathisch und abschließend. Nutze alle verfügbaren Daten.`;
    } else {
      return NextResponse.json({ error: 'Ungültiger Report-Typ' }, { status: 400 });
    }

    // Generate with GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: contextPrompt,
        },
        {
          role: 'user',
          content: 'Erstelle den Bericht basierend auf den bereitgestellten Informationen.',
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedContent = completion.choices[0].message.content || '';

    return NextResponse.json({ content: generatedContent });
  } catch (error: any) {
    console.error('Error generating smart report:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Bericht-Generierung' },
      { status: 500 }
    );
  }
}
