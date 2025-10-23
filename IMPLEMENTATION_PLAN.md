# Implementierungsplan: Strukturierte Klienten-Verwaltung & Anamnese

## 🎯 Anforderungen

### 1. **Strukturierte Klienten-Formulare**
- Kontaktdaten (Vorname, Nachname, Email, Telefon)
- Adresse (Straße, PLZ, Ort)
- Persönliche Daten (Geburtsdatum, Alter, Geschlecht)
- Soziale Daten (Familienstand, Kinder, Staatsangehörigkeit)
- Sprachniveau (Deutsch)
- Aufenthaltsstatus
- Berufliche Situation

### 2. **Audio-Transkription**
- Mikrofon → OpenAI Whisper → Text
- API-Route für Transkription
- Anwendung für Klienten-Profil UND Anamnese

### 3. **Anamnese-Workflow**
- **Direkt nach Klienten-Anlage**
- Erfassung des IST-Standes via Spracheingabe
- KI parst in strukturierte Felder:
  - Wohnsituation
  - Finanzielle Situation
  - Gesundheitszustand
  - Berufliche Situation
  - Familiäre Situation
  - Ziele und Wünsche
  - Bisherige Maßnahmen
- **Anpassbar** durch erneutes Einsprechen

### 4. **Workflow-Reihenfolge**
```
1. Klient anlegen (Basisdaten-Formular)
   ↓
2. Anamnese durchführen (Audio → strukturierte Felder)
   ↓
3. Termine protokollieren
   ↓
4. Berichte generieren
```

### 5. **Performance**
- Termin-Speicherung optimieren
- Loading-States zeigen
- Fehlerbehandlung verbessern

---

## 📋 Implementierung

### Phase 1: Audio-Transkription
- [ ] `/api/transcribe` Route erstellen
- [ ] OpenAI Whisper Integration
- [ ] Blob Upload & Transkription
- [ ] Fehlerbehandlung

### Phase 2: Strukturiertes Klienten-Formular
- [ ] Datenbank-Schema erweitern (profile_data JSONB)
- [ ] Formular mit allen Feldern
- [ ] Validierung
- [ ] Speichern & Laden

### Phase 3: Anamnese-System
- [ ] Anamnese-Dialog nach Klienten-Erstellung
- [ ] Audio-Aufnahme für Anamnese
- [ ] KI-Parsing in strukturierte Felder
- [ ] Anamnese-Bearbeitungs-Dialog
- [ ] Anamnese-Anzeige in Klienten-Detailansicht

### Phase 4: Performance & UX
- [ ] Loading-States für alle Aktionen
- [ ] Optimierte Queries
- [ ] Error-Boundaries
- [ ] Toast-Notifications

---

## 🏗️ Technische Struktur

### Datenbank-Erweiterung:
```typescript
clients.profile_data = {
  // Kontakt
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  
  // Adresse
  street: string,
  zipCode: string,
  city: string,
  
  // Persönlich
  dateOfBirth: string,
  age: number,
  gender: 'male' | 'female' | 'diverse' | 'not_specified',
  
  // Sozial
  maritalStatus: string,
  children: number,
  nationality: string,
  germanLevel: string,
  residenceStatus: string,
  
  // Beruflich
  occupation: string,
  employmentStatus: string,
  
  // Anamnese
  anamnesis: {
    housingituation: string,
    financialSituation: string,
    healthStatus: string,
    professionalSituation: string,
    familySituation: string,
    goalsAndWishes: string,
    previousMeasures: string,
    rawTranscript: string, // Original-Spracheingabe
    lastUpdated: string
  }
}
```

---

Soll ich mit der Implementierung beginnen?
