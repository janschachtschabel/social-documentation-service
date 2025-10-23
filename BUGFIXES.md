# Bugfixes und Verbesserungen

## Behobene Probleme

### 1. Anamnese-Integration
- Anamnese VOR Termine in Aktionen-Liste
- AnamnesisDialog integriert (leeres Formular mit 14 Feldern)
- Mikrofon-Unterstuetzung mit Parsing
- UPDATE-Funktion bei erneutem Einsprechen
- URL-Parameter anamnesis=true unterstuetzt

### 2. Klienten-Liste
- Ganze Zeile klickbar
- Loeschen-Symbol fuer Admins
- Bestaetigung beim Loeschen

### 3. Mikrofon bei Terminen
- Transkription mit Whisper API
- Audio Upload funktioniert

### 4. Termine speichern
- select und single verwenden
- Progress Indicators korrekt speichern
- Fehlerbehandlung verbessert

### 5. Feldstruktur
- actions_taken, current_status, next_steps, network_involvement
- Progress Indicators: finances, health, job_applications, family_situation, child_welfare

## Noch zu tun

### Berichte-Seite
- Neuer Bericht Button
- Leeres Formular
- Mikrofon-Unterstuetzung

### Statistik-Seite
- Kunden-Zusammensetzung
- Fortschritte je Klient
- Diagramme

### Daten fuer Statistik
- Bereits vorhanden in profile_data und progress_indicators
- Aggregationen moeglich
