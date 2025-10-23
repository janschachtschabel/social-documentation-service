# ✅ Differenzierung der Eingabemöglichkeiten

## 🎯 Übersicht der 3 Hauptbereiche

### **1. BASISPROFIL** (Einfach & Kontaktdaten)
### **2. ANAMNESE** (Sozialpädagogisch & Erziehungshilfe)
### **3. TERMINPROTOKOLLE** (TODO-orientiert)

---

## 1. 📋 BASISPROFIL - Einfache Kontakt- und Adressdaten

**Zweck:** Verwaltungsdaten für Klient

**Komponente:** `ClientForm.tsx`  
**Seite:** `/dashboard/clients/new`

### **Felder:**

#### **Kontaktdaten:**
- Vorname *(Pflicht)*
- Nachname *(Pflicht)*
- E-Mail
- Telefon

#### **Adresse:**
- Straße und Hausnummer
- PLZ
- Ort

#### **Persönliche Daten:**
- Geburtsdatum
- Alter
- Geschlecht (männlich/weiblich/divers/keine Angabe)

#### **Soziale Situation:**
- Familienstand
- Anzahl Kinder
- Staatsangehörigkeit
- Deutschkenntnisse (A1, B2, etc.)
- Aufenthaltsstatus

#### **Berufliche Situation:**
- Beruf / Ausbildung
- Beschäftigungsstatus

### **Spracheingabe:**
```
"Der Klient heißt Max Mustermann, 35 Jahre alt, 
wohnhaft in Berlin, Musterstraße 12, 10115 Berlin,
Telefon 030-12345678, verheiratet, 2 Kinder..."
```

**KI-Verhalten:** Extrahiert Daten und füllt Formularfelder  
**Update:** Bei erneutem Einsprechen → **Merge** mit bestehenden Daten

---

## 2. 🎓 ANAMNESE - Sozialpädagogisch & Erziehungshilfe

**Zweck:** IST-Stand für sozialpädagogische/Erziehungshilfe-Arbeit

**Komponente:** `AnamnesisDialog.tsx`  
**Aufruf:** Nach Klienten-Anlage oder `/clients/[id]?anamnesis=true`

### **Felder (14 Bereiche):**

#### **LEBENSSITUATION:**

1. **Wohnsituation**
   - Wohnform, Platzverhältnisse, Ausstattung
   - Probleme, kindgerechte Umgebung

2. **Finanzielle Situation**
   - Einkommen, Schulden, laufende Kosten
   - Finanzielle Unterstützung, wirtschaftliche Belastungen

3. **Gesundheitszustand**
   - Körperliche und psychische Gesundheit
   - Behandlungen, Medikamente, Einschränkungen

4. **Berufliche Situation**
   - Ausbildung, Beschäftigung, Arbeitszeiten
   - Vereinbarkeit Familie/Beruf

#### **FAMILIE & KINDER:** *(Sozialpädagogischer Fokus)*

5. **Familiäre Situation**
   - Familienstruktur, Beziehungen, Konflikte
   - Unterstützungssysteme innerhalb der Familie

6. **Situation der Kinder** ⭐ *NEU*
   - Anzahl, Alter, Betreuung, Schule/Kita
   - Auffälligkeiten, besondere Bedürfnisse

7. **Erziehungskompetenzen** ⭐ *NEU*
   - Erziehungsverhalten, Grenzsetzung
   - Emotionale Zuwendung, Überforderung, Ressourcen

8. **Entwicklungsstand der Kinder** ⭐ *NEU*
   - Körperliche, kognitive, emotionale und soziale Entwicklung
   - Entwicklungsverzögerungen, Förderbedarfe

#### **PSYCHOSOZIALE SITUATION:** ⭐ *NEU*

9. **Psychologischer Zustand**
   - Emotionale Befindlichkeit, Belastungen
   - Bewältigungsstrategien, psychische Auffälligkeiten, Resilienz

10. **Soziales Netzwerk**
    - Freunde, Verwandte, Nachbarn
    - Isolation, Unterstützungspersonen

11. **Krisen und Risikofaktoren**
    - Akute Krisen, Gewalt, Sucht
    - Vernachlässigung, **Kindeswohlgefährdung**

#### **ZIELE & MASSNAHMEN:**

12. **Ziele und Wünsche**
    - Was möchte die Familie/der Klient erreichen?
    - Motivation zur Veränderung

13. **Bisherige Maßnahmen**
    - Frühere Hilfen, Therapien, Beratungen
    - Jugendhilfe-Maßnahmen, Erfolge/Misserfolge

14. **Zusätzliche Notizen**
    - Sonstige wichtige Informationen

### **Spracheingabe:**
```
"Die Familie lebt in einer 3-Zimmer-Wohnung in einem Hochhaus.
Die finanzielle Situation ist angespannt durch Schulden.
Zwei Kinder, 5 und 8 Jahre alt, besuchen Kita und Grundschule.
Die Mutter zeigt sich überforder bei der Erziehung, setzt kaum Grenzen.
Das ältere Kind zeigt Entwicklungsverzögerungen im sprachlichen Bereich.
Psychisch ist die Mutter belastet, hatte in der Vergangenheit Depressionen.
Das soziale Netzwerk ist sehr klein, kaum Kontakte.
Es gab in der Vergangenheit häusliche Gewalt, aktuell keine akuten Krisen.
Ziel ist die Verbesserung der Erziehungskompetenzen und Stabilisierung der Familie..."
```

**KI-Verhalten:** 
- Strukturiert Transkript in 14 Felder
- Schreibt 2-5 vollständige Sätze pro Bereich
- Professioneller, sozialpädagogischer Duktus

**Update bei erneutem Einsprechen:** ✅ **MERGE-Funktion**
- Bestehende Daten bleiben erhalten
- Neue Informationen werden ergänzt
- Nur explizit erwähnte Bereiche werden aktualisiert
- Kein Überschreiben von nicht-erwähnten Bereichen

**Beispiel UPDATE:**
```
Erste Aufnahme: "Familie lebt in 3-Zimmer-Wohnung..."
→ Alle 14 Felder werden gefüllt

Zweite Aufnahme: "Update: Die finanzielle Situation hat sich verbessert, 
neue Stelle gefunden..."
→ Nur "financialSituation" und "professionalSituation" werden aktualisiert
→ Alle anderen 12 Felder bleiben unverändert ✅
```

---

## 3. 📝 TERMINPROTOKOLLE - TODO-orientiert

**Zweck:** Fortlaufende Dokumentation mit Handlungsorientierung

**Komponente:** Session-Dialog  
**Seite:** `/dashboard/clients/[id]` → Tab "Termine"

### **Felder:**

#### **TODO-Struktur:**

1. **Erledigte Aktion** (actions_taken)
   - Was wurde im Termin besprochen/unternommen?
   - Welche konkreten Schritte wurden durchgeführt?

2. **Aktueller Stand / Ergebnis** (current_status)
   - Was ist die aktuelle Situation?
   - Welches Ergebnis hat die Aktion gebracht?

3. **Nächste Schritte** (next_steps)
   - Was muss als nächstes getan werden?
   - Wer macht was bis wann?

4. **Netzwerkeinbezug** (network_involvement)
   - Welche externen Partner wurden einbezogen?
   - Welche Kooperationen laufen?

#### **Zusätzlich (automatisch durch KI):**

5. **Fortschrittsindikatoren** (0-10 Skala)
   - Finanzen
   - Gesundheit
   - Bewerbungsmanagement
   - Familiensituation
   - Kinderfürsorge

### **Spracheingabe:**
```
"Termin vom 15. Oktober.

ERLEDIGTE AKTIONEN:
Gemeinsam mit der Mutter wurde ein Haushaltsplan erstellt.
Kontakt zum Jugendamt aufgenommen wegen Erziehungsbeistand.

AKTUELLER STAND:
Die Mutter zeigt sich motiviert, den Plan umzusetzen.
Finanziell ist die Lage weiterhin angespannt, aber stabil.
Die Kinder profitieren von klareren Strukturen.

NÄCHSTE SCHRITTE:
In zwei Wochen Folgetermin zur Überprüfung des Haushaltsplans.
Termin beim Jugendamt am 20. Oktober wahrnehmen.
Erziehungsbeistand soll ab November starten.

NETZWERK:
Jugendamt einbezogen, Frau Schmidt ist Ansprechpartnerin.
Kontakt zur Schuldnerberatung hergestellt."
```

**KI-Verhalten:**
- Extrahiert die 4 Hauptfelder
- Identifiziert Fortschrittsindikatoren (Skala 0-10)
- Strukturiert chronologisch

**Update:** Jeder Termin ist eine neue Zeile → **Kein Merge**, sondern **Verlauf**

---

## 4. 📊 BERICHTE - KI-generiert

**Zweck:** Zusammenfassende Berichte aus Terminen

**Komponente:** Report-Dialog  
**Seite:** `/dashboard/reports`

### **Berichtstypen:**

1. **Anamnese-Bericht**
   - Basiert auf: Basisprofil + Anamnese
   - Erstmalige Situationserfassung

2. **Zwischenbericht**
   - Basiert auf: Basisprofil + Anamnese + Termine
   - Verlauf, Fortschritte, aktuelle Maßnahmen

3. **Endbericht**
   - Basiert auf: Alle Daten
   - Gesamtverlauf, Zielerreichung, Abschluss

**Spracheingabe:** Keine (wird generiert)

**KI-Verhalten:**
- Analysiert alle Termine
- Fasst Entwicklung zusammen
- Professioneller Berichtsstil
- Strukturiert nach Vorgabe

---

## ✅ Zusammenfassung Differenzierung

| Bereich | Fokus | Felder | Update-Verhalten | KI-Aufgabe |
|---------|-------|--------|------------------|-----------|
| **Basisprofil** | Verwaltung | 15 einfache Felder | Merge | Daten extrahieren |
| **Anamnese** | IST-Stand | 14 sozialpäd. Bereiche | **Merge** ✅ | Strukturieren |
| **Termine** | TODOs | 4 Handlungsfelder | Neue Zeile | Extrahieren |
| **Berichte** | Zusammenfassung | - | - | Generieren |

---

## 🔄 UPDATE-Funktionalität Details

### **Merge-Logik bei Anamnese:**

```typescript
// Bestehende Daten:
{
  housingSituation: "3-Zimmer-Wohnung...",
  financialSituation: "Schulden von 5000€...",
  childrenSituation: "2 Kinder, 5 und 8 Jahre..."
  // ... 11 weitere Felder
}

// Neue Spracheingabe:
"Update: Die Schulden sind jetzt abbezahlt, 
finanzielle Situation hat sich stark verbessert."

// KI erkennt:
- financialSituation wird erwähnt → UPDATE
- Andere Bereiche werden NICHT erwähnt → BEHALTEN

// Ergebnis:
{
  housingSituation: "3-Zimmer-Wohnung...",  // UNVERÄNDERT ✅
  financialSituation: "Die Schulden sind komplett abbezahlt. Die finanzielle Situation hat sich stark verbessert und ist nun stabil.",  // AKTUALISIERT ✅
  childrenSituation: "2 Kinder, 5 und 8 Jahre..."  // UNVERÄNDERT ✅
  // ... 11 weitere unveränderte Felder
}
```

### **API-Parameter:**

```typescript
POST /api/parse-anamnesis
{
  "transcript": "Neue Spracheingabe...",
  "existingData": { /* bestehende Anamnese-Daten */ }
}

// KI-Prompt enthält:
"Es existieren bereits Daten. Ergänze oder aktualisiere nur 
die Bereiche, die im neuen Transkript erwähnt werden.
Bestehende Informationen sollen ERHALTEN bleiben."
```

---

## ✨ Features

✅ **Basisprofil:** Einfach, klar, administrativ  
✅ **Anamnese:** Sozialpädagogisch differenziert (14 Bereiche)  
✅ **Kinder-Fokus:** Entwicklungsstand, Erziehungskompetenzen  
✅ **Psychologisch:** Zustand, Netzwerk, Krisen/Risiken  
✅ **Termine:** TODO-orientiert (Aktion → Stand → Nächste Schritte)  
✅ **UPDATE:** Merge-Funktion bei erneutem Einsprechen  
✅ **Berichte:** KI-generiert aus allen Daten  

---

**Die Eingabemöglichkeiten sind jetzt klar differenziert für sozialpädagogische Erziehungshilfe-Arbeit!** 🎯
