'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import ClientForm, { ClientFormData } from '@/components/ClientForm';

const emptyFormData: ClientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  zipCode: '',
  city: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  maritalStatus: '',
  children: '',
  nationality: '',
  germanLevel: '',
  residenceStatus: '',
  occupation: '',
  employmentStatus: '',
};

const steps = ['Basisdaten erfassen', 'Anamnese durchführen'];

export default function NewClientPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ClientFormData>(emptyFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);

  const handleAudioTranscript = async (transcript: string) => {
    setLoading(true);
    setError('');

    try {
      // Parse transcript via API
      const response = await fetch('/api/parse-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Parsen der Spracheingabe');
      }

      const parsed = await response.json();

      // Merge parsed data with existing form data
      setFormData((prev) => ({
        ...prev,
        ...parsed.profile_data,
        firstName: parsed.profile_data?.firstName || prev.firstName,
        lastName: parsed.profile_data?.lastName || prev.lastName,
      }));
    } catch (err: any) {
      setError(err.message || 'Fehler beim Verarbeiten der Spracheingabe');
    }

    setLoading(false);
  };

  const handleSaveBasicData = async () => {
    // Validate
    if (!formData.firstName || !formData.lastName) {
      setError('Vor- und Nachname sind erforderlich');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const name = `${formData.firstName} ${formData.lastName}`;
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          name,
          profile_data: formData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setClientId(data.id);
      setActiveStep(1); // Go to Anamnesis
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern');
    }

    setLoading(false);
  };

  const handleSkipAnamnesis = () => {
    router.push('/dashboard/clients');
  };

  const handleGoToAnamnesis = () => {
    if (clientId) {
      router.push(`/dashboard/clients/${clientId}?anamnesis=true`);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Neuen Klienten anlegen
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Erfassen Sie die Basisdaten des Klienten und führen Sie anschließend die Anamnese durch.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {activeStep === 0 ? (
        <Card>
          <CardContent>
            <ClientForm
              formData={formData}
              onChange={setFormData}
              onAudioTranscript={handleAudioTranscript}
              disabled={loading}
            />

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => router.back()} disabled={loading}>
                Abbrechen
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveBasicData}
                disabled={loading || !formData.firstName || !formData.lastName}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Speichert...' : 'Weiter zur Anamnese'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basisdaten erfolgreich gespeichert!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Der Klient <strong>{formData.firstName} {formData.lastName}</strong> wurde angelegt.
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ mt: 3 }}>
              Möchten Sie jetzt die Anamnese durchführen?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Die Anamnese erfasst den aktuellen IST-Stand des Klienten in verschiedenen Lebensbereichen
              (Wohnsituation, finanzielle Situation, Gesundheit, etc.). Sie können diese auch später ergänzen.
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button onClick={handleSkipAnamnesis} variant="outlined">
                Später
              </Button>
              <Button onClick={handleGoToAnamnesis} variant="contained">
                Jetzt Anamnese durchführen
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
