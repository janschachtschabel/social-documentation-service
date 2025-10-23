'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Mic as MicIcon, Stop as StopIcon } from '@mui/icons-material';

export interface ClientFormData {
  // Kontaktdaten
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Adresse
  street: string;
  zipCode: string;
  city: string;
  
  // Persönliche Daten
  dateOfBirth: string;
  age: string;
  gender: 'male' | 'female' | 'diverse' | 'not_specified' | '';
  
  // Soziale Daten
  maritalStatus: string;
  children: string;
  nationality: string;
  germanLevel: string;
  residenceStatus: string;
  
  // Berufliche Situation
  occupation: string;
  employmentStatus: string;
}

interface ClientFormProps {
  formData: ClientFormData;
  onChange: (data: ClientFormData) => void;
  onAudioTranscript?: (transcript: string) => void;
  disabled?: boolean;
}

export default function ClientForm({ formData, onChange, onAudioTranscript, disabled = false }: ClientFormProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleChange = (field: keyof ClientFormData, value: string) => {
    onChange({
      ...formData,
      [field]: value,
    });
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
        
        // Upload to transcription API
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const { transcript } = await response.json();
            if (onAudioTranscript) {
              onAudioTranscript(transcript);
            }
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mikrofon-Zugriff verweigert:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <Box>
      {onAudioTranscript && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isRecording ? 'Aufnahme stoppen' : 'Daten einsprechen'}>
            <IconButton
              onClick={isRecording ? stopRecording : startRecording}
              color={isRecording ? 'error' : 'primary'}
              disabled={disabled}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
          </Tooltip>
          {isRecording && (
            <Typography variant="body2" color="error">
              Aufnahme läuft...
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Kontaktdaten */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Kontaktdaten
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Vorname"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Nachname"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="E-Mail"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Telefon"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        {/* Adresse */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Adresse
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Straße und Hausnummer"
            value={formData.street}
            onChange={(e) => handleChange('street', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="PLZ"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Ort"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        {/* Persönliche Daten */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Persönliche Daten
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Geburtsdatum"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Alter"
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            select
            label="Geschlecht"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            disabled={disabled}
          >
            <MenuItem value="male">Männlich</MenuItem>
            <MenuItem value="female">Weiblich</MenuItem>
            <MenuItem value="diverse">Divers</MenuItem>
            <MenuItem value="not_specified">Keine Angabe</MenuItem>
          </TextField>
        </Grid>

        {/* Soziale Daten */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Soziale Situation
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Familienstand"
            value={formData.maritalStatus}
            onChange={(e) => handleChange('maritalStatus', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Anzahl Kinder"
            type="number"
            value={formData.children}
            onChange={(e) => handleChange('children', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Staatsangehörigkeit"
            value={formData.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Deutschkenntnisse"
            value={formData.germanLevel}
            onChange={(e) => handleChange('germanLevel', e.target.value)}
            placeholder="z.B. A1, B2, Muttersprache"
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Aufenthaltsstatus"
            value={formData.residenceStatus}
            onChange={(e) => handleChange('residenceStatus', e.target.value)}
            placeholder="z.B. unbefristet, befristet, Duldung"
            disabled={disabled}
          />
        </Grid>

        {/* Berufliche Situation */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Berufliche Situation
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Beruf / Ausbildung"
            value={formData.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Beschäftigungsstatus"
            value={formData.employmentStatus}
            onChange={(e) => handleChange('employmentStatus', e.target.value)}
            placeholder="z.B. arbeitslos, Teilzeit, Vollzeit"
            disabled={disabled}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
