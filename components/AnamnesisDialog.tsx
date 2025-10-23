'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { Mic as MicIcon, Stop as StopIcon, Edit as EditIcon } from '@mui/icons-material';

export interface AnamnesisData {
  // Lebenssituation
  housingSituation: string;
  financialSituation: string;
  healthStatus: string;
  professionalSituation: string;
  
  // Familie & Kinder (Sozialpädagogik)
  familySituation: string;
  childrenSituation: string;
  parentingSkills: string;
  childDevelopment: string;
  
  // Psychosoziale Situation
  psychologicalState: string;
  socialNetwork: string;
  crisesAndRisks: string;
  
  // Ziele & Maßnahmen
  goalsAndWishes: string;
  previousMeasures: string;
  additionalNotes?: string;
  rawTranscript?: string;
}

interface AnamnesisDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: AnamnesisData) => Promise<void>;
  initialData?: AnamnesisData;
  clientName: string;
}

export default function AnamnesisDialog({
  open,
  onClose,
  onSave,
  initialData,
  clientName,
}: AnamnesisDialogProps) {
  const [mode, setMode] = useState<'record' | 'edit'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcript, setTranscript] = useState(initialData?.rawTranscript || '');
  const [parsedData, setParsedData] = useState<AnamnesisData | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        setLoading(true);
        try {
          // Transcribe
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!transcribeResponse.ok) {
            throw new Error('Fehler bei der Transkription');
          }

          const { transcript: transcribedText } = await transcribeResponse.json();
          setTranscript(transcribedText);

          // Parse (mit bestehenden Daten für UPDATE)
          const parseResponse = await fetch('/api/parse-anamnesis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              transcript: transcribedText,
              existingData: parsedData || initialData // Merge mit bestehenden Daten
            }),
          });

          if (!parseResponse.ok) {
            throw new Error('Fehler beim Parsen');
          }

          const parsed = await parseResponse.json();
          setParsedData({
            ...parsed,
            rawTranscript: transcribedText,
          });
          setMode('edit');
        } catch (err: any) {
          setError(err.message || 'Fehler bei der Verarbeitung');
        }

        setLoading(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Mikrofon-Zugriff verweigert');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleFieldChange = (field: keyof AnamnesisData, value: string) => {
    setParsedData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!parsedData) {
      setError('Bitte erfassen Sie zuerst die Anamnese');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(parsedData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    }

    setLoading(false);
  };

  const handleReRecord = () => {
    setMode('record');
    setTranscript('');
    setParsedData(null);
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Anamnese für {clientName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {mode === 'record' ? (
          <Box sx={{ py: 4 }}>
            <Typography variant="body1" gutterBottom>
              Erfassen Sie den IST-Stand des Klienten durch Spracheingabe.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Sprechen Sie über folgende Bereiche:
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
              <li><strong>Lebenssituation:</strong> Wohnung, Finanzen, Gesundheit, Beruf</li>
              <li><strong>Familie & Kinder:</strong> Familienstruktur, Kindersituation, Erziehung, Entwicklung</li>
              <li><strong>Psychosozial:</strong> Psych. Zustand, soziales Netzwerk, Krisen/Risiken</li>
              <li><strong>Ziele & Maßnahmen:</strong> Wünsche, bisherige Hilfen</li>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                color={isRecording ? 'error' : 'primary'}
                sx={{ width: 80, height: 80 }}
              >
                {isRecording ? <StopIcon sx={{ fontSize: 48 }} /> : <MicIcon sx={{ fontSize: 48 }} />}
              </IconButton>
              <Typography variant="body2" color={isRecording ? 'error' : 'text.secondary'}>
                {isRecording
                  ? 'Aufnahme läuft... Klicken Sie erneut, um zu stoppen'
                  : loading
                  ? 'Verarbeite...'
                  : 'Klicken Sie auf das Mikrofon, um zu starten'}
              </Typography>
              {loading && <CircularProgress size={24} />}
            </Box>

            {transcript && !parsedData && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Transkript:
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  disabled={loading}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Strukturiert" />
                <Tab label="Original" />
              </Tabs>
              <Button startIcon={<MicIcon />} onClick={handleReRecord} size="small">
                Neu aufnehmen
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {tab === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* LEBENSSITUATION */}
                <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
                  Lebenssituation
                </Typography>
                <Divider />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Wohnsituation"
                  value={parsedData?.housingSituation || ''}
                  onChange={(e) => handleFieldChange('housingSituation', e.target.value)}
                  disabled={loading}
                  helperText="Wohnform, Platzverhältnisse, kindgerechte Umgebung"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Finanzielle Situation"
                  value={parsedData?.financialSituation || ''}
                  onChange={(e) => handleFieldChange('financialSituation', e.target.value)}
                  disabled={loading}
                  helperText="Einkommen, Schulden, finanzielle Unterstützung"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Gesundheitszustand"
                  value={parsedData?.healthStatus || ''}
                  onChange={(e) => handleFieldChange('healthStatus', e.target.value)}
                  disabled={loading}
                  helperText="Körperliche und psychische Gesundheit"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Berufliche Situation"
                  value={parsedData?.professionalSituation || ''}
                  onChange={(e) => handleFieldChange('professionalSituation', e.target.value)}
                  disabled={loading}
                  helperText="Ausbildung, Beschäftigung, Vereinbarkeit Familie/Beruf"
                />

                {/* FAMILIE & KINDER */}
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  Familie & Kinder
                </Typography>
                <Divider />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Familiäre Situation"
                  value={parsedData?.familySituation || ''}
                  onChange={(e) => handleFieldChange('familySituation', e.target.value)}
                  disabled={loading}
                  helperText="Familienstruktur, Beziehungen, Konflikte"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Situation der Kinder"
                  value={parsedData?.childrenSituation || ''}
                  onChange={(e) => handleFieldChange('childrenSituation', e.target.value)}
                  disabled={loading}
                  helperText="Anzahl, Alter, Betreuung, Schule/Kita, Auffälligkeiten"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Erziehungskompetenzen"
                  value={parsedData?.parentingSkills || ''}
                  onChange={(e) => handleFieldChange('parentingSkills', e.target.value)}
                  disabled={loading}
                  helperText="Erziehungsverhalten, Grenzsetzung, emotionale Zuwendung"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Entwicklungsstand der Kinder"
                  value={parsedData?.childDevelopment || ''}
                  onChange={(e) => handleFieldChange('childDevelopment', e.target.value)}
                  disabled={loading}
                  helperText="Körperliche, kognitive, emotionale und soziale Entwicklung"
                />

                {/* PSYCHOSOZIALE SITUATION */}
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  Psychosoziale Situation
                </Typography>
                <Divider />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Psychologischer Zustand"
                  value={parsedData?.psychologicalState || ''}
                  onChange={(e) => handleFieldChange('psychologicalState', e.target.value)}
                  disabled={loading}
                  helperText="Emotionale Befindlichkeit, Belastungen, Resilienz"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Soziales Netzwerk"
                  value={parsedData?.socialNetwork || ''}
                  onChange={(e) => handleFieldChange('socialNetwork', e.target.value)}
                  disabled={loading}
                  helperText="Freunde, Verwandte, Unterstützungspersonen, Isolation"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Krisen und Risikofaktoren"
                  value={parsedData?.crisesAndRisks || ''}
                  onChange={(e) => handleFieldChange('crisesAndRisks', e.target.value)}
                  disabled={loading}
                  helperText="Akute Krisen, Gewalt, Sucht, Vernachlässigung, Kindeswohlgefährdung"
                />

                {/* ZIELE & MASSNAHMEN */}
                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  Ziele & Maßnahmen
                </Typography>
                <Divider />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Ziele und Wünsche"
                  value={parsedData?.goalsAndWishes || ''}
                  onChange={(e) => handleFieldChange('goalsAndWishes', e.target.value)}
                  disabled={loading}
                  helperText="Was möchte die Familie erreichen?"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Bisherige Maßnahmen"
                  value={parsedData?.previousMeasures || ''}
                  onChange={(e) => handleFieldChange('previousMeasures', e.target.value)}
                  disabled={loading}
                  helperText="Frühere Hilfen, Therapien, Jugendhilfe-Maßnahmen"
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Zusätzliche Notizen"
                  value={parsedData?.additionalNotes || ''}
                  onChange={(e) => handleFieldChange('additionalNotes', e.target.value)}
                  disabled={loading}
                />
              </Box>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={15}
                label="Original-Transkript"
                value={parsedData?.rawTranscript || transcript}
                InputProps={{ readOnly: true }}
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        {mode === 'edit' && (
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Speichert...' : 'Anamnese speichern'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
