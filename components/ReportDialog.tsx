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
  MenuItem,
} from '@mui/material';
import { Mic as MicIcon, Stop as StopIcon } from '@mui/icons-material';

export interface ReportFormData {
  reportType: 'anamnese' | 'interim' | 'final';
  title: string;
  content: string;
  rawTranscript?: string;
}

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReportFormData) => Promise<void>;
  clientName: string;
  initialData?: Partial<ReportFormData>;
}

export default function ReportDialog({
  open,
  onClose,
  onSave,
  clientName,
  initialData,
}: ReportDialogProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    reportType: initialData?.reportType || 'interim',
    title: initialData?.title || '',
    content: initialData?.content || '',
    rawTranscript: initialData?.rawTranscript || '',
  });
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypeLabels = {
    anamnese: 'Anamnese-Bericht',
    interim: 'Zwischenbericht',
    final: 'Abschlussbericht',
  };

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
          const formDataUpload = new FormData();
          formDataUpload.append('audio', audioBlob);

          const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formDataUpload,
          });

          if (!transcribeResponse.ok) {
            throw new Error('Fehler bei der Transkription');
          }

          const { transcript: transcribedText } = await transcribeResponse.json();
          
          // Append to content
          setFormData((prev) => ({
            ...prev,
            content: prev.content 
              ? `${prev.content}\n\n${transcribedText}` 
              : transcribedText,
            rawTranscript: prev.rawTranscript 
              ? `${prev.rawTranscript}\n\n${transcribedText}` 
              : transcribedText,
          }));
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

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Titel ist erforderlich');
      return;
    }

    if (!formData.content.trim()) {
      setError('Inhalt ist erforderlich');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Neuen Bericht erstellen für {clientName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            fullWidth
            label="Berichtstyp"
            value={formData.reportType}
            onChange={(e) => setFormData((prev) => ({ 
              ...prev, 
              reportType: e.target.value as 'anamnese' | 'interim' | 'final' 
            }))}
            disabled={loading}
          >
            <MenuItem value="anamnese">Anamnese-Bericht</MenuItem>
            <MenuItem value="interim">Zwischenbericht</MenuItem>
            <MenuItem value="final">Abschlussbericht</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Titel"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder={`z.B. ${reportTypeLabels[formData.reportType]} ${clientName}`}
            disabled={loading}
          />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconButton
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                color={isRecording ? 'error' : 'primary'}
                size="large"
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>
              <Typography variant="body2" color={isRecording ? 'error' : 'text.secondary'}>
                {isRecording
                  ? 'Aufnahme läuft... Klicken Sie erneut, um zu stoppen'
                  : loading
                  ? 'Verarbeite...'
                  : 'Klicken Sie auf das Mikrofon für Spracheingabe'}
              </Typography>
              {loading && <CircularProgress size={20} />}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={15}
              label="Berichtsinhalt"
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Schreiben Sie den Bericht oder nutzen Sie die Spracheingabe..."
              disabled={loading}
              helperText="Sie können schreiben oder einsprechen. Bei erneutem Einsprechen wird der Text ergänzt."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Abbrechen
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Speichert...' : 'Bericht speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
