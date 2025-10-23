import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedSessionData {
  current_status: string;
  actions_taken: string;
  next_steps: string;
  network_involvement: string;
  progress_indicators?: {
    finances?: number;
    health?: number;
    job_applications?: number;
    family_situation?: number;
    child_welfare?: number;
  };
}

export async function parseSessionTranscript(transcript: string): Promise<ParsedSessionData> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Du bist ein Assistent für Sozialarbeiter. Analysiere das Gesprächsprotokoll und extrahiere folgende Informationen:
1. Aktueller Stand (current_status): Wie ist die aktuelle Situation des Klienten?
2. Vorgenommene Aktionen (actions_taken): Was wurde bereits unternommen?
3. Nächste Schritte (next_steps): Was sind die geplanten nächsten Schritte?
4. Netzwerkeinbezug (network_involvement): Welche externen Partner oder Dienste wurden/werden einbezogen?

Zusätzlich bewerte folgende Fortschrittsindikatoren auf einer Skala von 0-10:
- finances (Finanzen)
- health (Gesundheit)
- job_applications (Bewerbungsmanagement)
- family_situation (Familiensituation)
- child_welfare (Kinderfürsorge)

Gib die Antwort als JSON zurück.`,
      },
      {
        role: 'user',
        content: transcript,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{}');
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'de');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.text;
}

export async function generateReport(
  reportType: 'anamnese' | 'interim' | 'final',
  clientName: string,
  sessions: Array<{
    session_date: string;
    current_status: string;
    actions_taken: string;
    next_steps: string;
    network_involvement: string;
  }>,
  profileData?: any
): Promise<string> {
  let systemPrompt = '';
  
  if (reportType === 'anamnese') {
    systemPrompt = `Erstelle eine strukturierte Anamnese für einen Klienten der Sozialarbeit. 
Die Anamnese sollte folgende Bereiche umfassen:
- Persönliche Daten und aktuelle Lebenssituation
- Problemstellung und Ausgangslage
- Ressourcen und Stärken
- Ziele und Erwartungen
- Erste Einschätzung

Schreibe professionell, empathisch und strukturiert.`;
  } else if (reportType === 'interim') {
    systemPrompt = `Erstelle einen Zwischenbericht über den Betreuungsverlauf eines Klienten.
Der Bericht sollte folgende Bereiche umfassen:
- Zusammenfassung der bisherigen Entwicklung
- Erreichte Ziele und Fortschritte
- Herausforderungen und Schwierigkeiten
- Aktuelle Maßnahmen und Interventionen
- Ausblick und weitere Planung

Schreibe professionell, sachlich und strukturiert.`;
  } else {
    systemPrompt = `Erstelle einen abschließenden Ergebnisbericht über die Betreuung eines Klienten.
Der Bericht sollte folgende Bereiche umfassen:
- Ausgangssituation (Verweis auf Anamnese)
- Verlauf der Betreuung
- Erreichte Ziele und Erfolge
- Nicht erreichte Ziele und Gründe
- Abschließende Bewertung und Empfehlungen
- Übergabe und Nachbetreuung (falls relevant)

Schreibe professionell, abschließend und strukturiert.`;
  }

  const sessionsText = sessions.map((s, i) => 
    `\n\nTermin ${i + 1} (${new Date(s.session_date).toLocaleDateString('de-DE')}):
Aktueller Stand: ${s.current_status}
Vorgenommene Aktionen: ${s.actions_taken}
Nächste Schritte: ${s.next_steps}
Netzwerkeinbezug: ${s.network_involvement}`
  ).join('\n');

  const profileText = profileData ? `\n\nProfilinformationen:\n${JSON.stringify(profileData, null, 2)}` : '';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Erstelle einen ${reportType === 'anamnese' ? 'Anamnese' : reportType === 'interim' ? 'Zwischenbericht' : 'Abschlussbericht'} für:

Klient: ${clientName}${profileText}

Gesprächsprotokolle:${sessionsText}`,
      },
    ],
  });

  return completion.choices[0].message.content || '';
}

export async function parseClientProfile(transcript: string): Promise<{ name: string; profile_data: any }> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Du bist ein Assistent für Sozialarbeiter. Extrahiere aus dem Gespräch die Profildaten des Klienten.
Mindestens der Name muss vorhanden sein. Weitere relevante Informationen können sein:
- Alter
- Geschlecht
- Kontaktdaten
- Wohnsituation
- Familiensituation
- Berufliche Situation
- Besondere Umstände

Gib die Antwort als JSON mit den Feldern "name" (Pflicht) und "profile_data" (Objekt mit weiteren Informationen) zurück.`,
      },
      {
        role: 'user',
        content: transcript,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{"name": "", "profile_data": {}}');
}

export { openai };
