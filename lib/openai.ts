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

export async function parseSessionTranscript(
  transcript: string,
  existingData?: Partial<ParsedSessionData>
): Promise<ParsedSessionData> {
  const systemPrompt = `Du bist ein Assistent für Sozialarbeiter. Analysiere das Gesprächsprotokoll und extrahiere folgende Informationen:
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

${existingData ? `
**WICHTIG:** Es existieren bereits Daten für diesen Termin. Ergänze oder aktualisiere nur die Bereiche, die im neuen Transkript erwähnt werden. Bestehende Informationen sollen ERHALTEN bleiben und ergänzt werden, nicht überschrieben.

Bestehende Daten:
${JSON.stringify(existingData, null, 2)}

Kombiniere die neuen Informationen MIT den bestehenden. Wenn ein Bereich im neuen Transkript nicht erwähnt wird, übernimm die bestehenden Daten.
` : ''}

Gib die Antwort als JSON zurück.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
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
        content: `Du bist ein Assistent für Sozialarbeiter. Extrahiere aus dem Gespräch die strukturierten Profildaten des Klienten.

Erforderliche Felder:
- firstName (Vorname)
- lastName (Nachname)

Optionale Felder (wenn erwähnt):
- email, phone
- street, zipCode, city
- dateOfBirth (Format: YYYY-MM-DD), age, gender (male/female/diverse/not_specified)
- maritalStatus, children (Anzahl), nationality, germanLevel
- residenceStatus, occupation, employmentStatus

Gib die Antwort als JSON zurück mit:
{
  "name": "Vorname Nachname",
  "profile_data": { alle extrahierten Felder }
}`,
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

export interface ParsedAnamnesis {
  // Lebenssituation
  housingSituation: string;
  financialSituation: string;
  healthStatus: string;
  professionalSituation: string;
  
  // Familie & Kinder (ERWEITERT für Sozialpädagogik)
  familySituation: string;
  childrenSituation: string;  // NEU: Kinder-spezifisch
  parentingSkills: string;     // NEU: Erziehungskompetenzen
  childDevelopment: string;    // NEU: Entwicklungsstand der Kinder
  
  // Psychosoziale Situation (NEU)
  psychologicalState: string;  // NEU: Psychologischer Zustand
  socialNetwork: string;        // NEU: Soziales Netzwerk
  crisesAndRisks: string;       // NEU: Krisen und Risikofaktoren
  
  // Ziele & Maßnahmen
  goalsAndWishes: string;
  previousMeasures: string;
  additionalNotes?: string;
}

export async function parseAnamnesis(
  transcript: string, 
  existingData?: Partial<ParsedAnamnesis>
): Promise<ParsedAnamnesis> {
  const systemPrompt = `Du bist ein Assistent für Sozialpädagogik und Erziehungshilfe. Analysiere die Anamnese-Aufnahme und strukturiere sie in folgende Bereiche:

**LEBENSSITUATION:**
1. housingSituation: Wohnsituation (Wohnform, Platzverhältnisse, Ausstattung, Probleme, kindgerechte Umgebung)
2. financialSituation: Finanzielle Situation (Einkommen, Schulden, laufende Kosten, finanzielle Unterstützung, wirtschaftliche Belastungen)
3. healthStatus: Gesundheitszustand (körperliche und psychische Gesundheit, Behandlungen, Medikamente, Einschränkungen)
4. professionalSituation: Berufliche Situation (Ausbildung, Beschäftigung, Arbeitszeiten, Vereinbarkeit Familie/Beruf)

**FAMILIE & KINDER (Sozialpädagogischer Fokus):**
5. familySituation: Familiäre Situation (Familienstruktur, Beziehungen, Konflikte, Unterstützungssysteme innerhalb der Familie)
6. childrenSituation: Situation der Kinder (Anzahl, Alter, Betreuung, Schule/Kita, Auffälligkeiten, besondere Bedürfnisse)
7. parentingSkills: Erziehungskompetenzen (Erziehungsverhalten, Grenzsetzung, emotionale Zuwendung, Überforderung, Ressourcen)
8. childDevelopment: Entwicklungsstand der Kinder (körperliche, kognitive, emotionale und soziale Entwicklung, Entwicklungsverzögerungen, Förderbedarfe)

**PSYCHOSOZIALE SITUATION:**
9. psychologicalState: Psychologischer Zustand (emotionale Befindlichkeit, Belastungen, Bewältigungsstrategien, psychische Auffälligkeiten, Resilienz)
10. socialNetwork: Soziales Netzwerk (Freunde, Verwandte, Nachbarn, Isolation, Unterstützungspersonen)
11. crisesAndRisks: Krisen und Risikofaktoren (akute Krisen, Gewalt, Sucht, Vernachlässigung, Kindeswohlgefährdung)

**ZIELE & MASSNAHMEN:**
12. goalsAndWishes: Ziele und Wünsche (Was möchte die Familie/der Klient erreichen? Motivation zur Veränderung)
13. previousMeasures: Bisherige Maßnahmen (Frühere Hilfen, Therapien, Beratungen, Jugendhilfe-Maßnahmen, Erfolge/Misserfolge)
14. additionalNotes: Sonstige wichtige Informationen

${existingData ? `
**WICHTIG:** Es existieren bereits Daten. Ergänze oder aktualisiere nur die Bereiche, die im neuen Transkript erwähnt werden. Bestehende Informationen sollen ERHALTEN bleiben, nicht überschrieben werden, es sei denn, es gibt explizite Updates.

Bestehende Daten:
${JSON.stringify(existingData, null, 2)}

Kombiniere die neuen Informationen MIT den bestehenden. Wenn ein Bereich im neuen Transkript nicht erwähnt wird, übernimm die bestehenden Daten.
` : ''}

Schreibe für jeden Bereich 2-5 vollständige, professionelle Sätze. Falls ein Bereich nicht erwähnt wird UND keine bestehenden Daten vorliegen, schreibe "Keine Angaben".

Gib die Antwort als JSON zurück mit allen 14 Feldern.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
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

export { openai };
