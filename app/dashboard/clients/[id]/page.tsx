'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Chip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import AnamnesisDialog, { AnamnesisData } from '@/components/AnamnesisDialog';
import ReportDialog, { ReportFormData } from '@/components/ReportDialog';

interface Client {
  id: string;
  name: string;
  profile_data: any;
  created_at: string;
}

interface Session {
  id: string;
  session_date: string;
  current_status: string;
  actions_taken: string;
  next_steps: string;
  network_involvement: string;
  raw_transcript: string;
}

interface Report {
  id: string;
  report_type: string;
  title: string;
  content: string;
  created_at: string;
  metadata?: {
    rawTranscript?: string;
  };
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [openAnamnesisDialog, setOpenAnamnesisDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadClientData();
    
    // Check URL parameter for anamnesis
    if (searchParams?.get('anamnesis') === 'true') {
      setOpenAnamnesisDialog(true);
    }
  }, [clientId, searchParams]);

  const loadClientData = async () => {
    // Load client
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientData) {
      setClient(clientData);
    }

    // Load sessions
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('client_id', clientId)
      .order('session_date', { ascending: false });

    if (sessionsData) {
      setSessions(sessionsData);
    }

    // Load reports
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (reportsData) {
      setReports(reportsData);
    }
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
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const transcribeResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (transcribeResponse.ok) {
            const { transcript: transcribedText } = await transcribeResponse.json();
            setTranscript(transcribedText);
          } else {
            setError('Fehler bei der Transkription');
          }
        } catch (err) {
          setError('Fehler bei der Verarbeitung');
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

  const handleCreateSession = async () => {
    if (!transcript.trim()) {
      setError('Bitte geben Sie Gesprächsnotizen ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse the transcript via API with existing data if editing
      const existingData = editingSession ? {
        current_status: editingSession.current_status,
        actions_taken: editingSession.actions_taken,
        next_steps: editingSession.next_steps,
        network_involvement: editingSession.network_involvement,
      } : undefined;

      const response = await fetch('/api/parse-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, existingData }),
      });

      const parsed = await response.json();

      if (!response.ok) {
        throw new Error(parsed.error || 'Fehler beim Parsen');
      }

      // Create or update session
      let sessionData;
      let insertError;

      if (editingSession) {
        // Update existing session
        const { data, error } = await supabase
          .from('sessions')
          .update({
            session_date: `${sessionDate}T${new Date().toISOString().split('T')[1]}`,
            current_status: parsed.current_status || '',
            actions_taken: parsed.actions_taken || '',
            next_steps: parsed.next_steps || '',
            network_involvement: parsed.network_involvement || '',
            raw_transcript: editingSession.raw_transcript 
              ? `${editingSession.raw_transcript}\n\n---\n\n${transcript}`
              : transcript,
          })
          .eq('id', editingSession.id)
          .select()
          .single();
        sessionData = data;
        insertError = error;
      } else {
        // Create new session with selected date
        const { data, error } = await supabase
          .from('sessions')
          .insert({
            client_id: clientId,
            session_date: `${sessionDate}T${new Date().toISOString().split('T')[1]}`,
            current_status: parsed.current_status || '',
            actions_taken: parsed.actions_taken || '',
            next_steps: parsed.next_steps || '',
            network_involvement: parsed.network_involvement || '',
            raw_transcript: transcript,
            created_by: user?.id,
          })
          .select()
          .single();
        sessionData = data;
        insertError = error;
      }

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Save progress indicators if available
      if (parsed.progress_indicators && sessionData) {
        const indicators = Object.entries(parsed.progress_indicators)
          .filter(([_, value]) => value !== null && value !== undefined)
          .map(([type, value]) => ({
            client_id: clientId,
            session_id: sessionData.id,
            indicator_type: type,
            value: value as number,
          }));

        if (indicators.length > 0) {
          await supabase.from('progress_indicators').insert(indicators);
        }
      }

      setOpenSessionDialog(false);
      setTranscript('');
      setEditingSession(null);
      setSessionDate(new Date().toISOString().split('T')[0]);
      await loadClientData();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen des Termins');
    }

    setLoading(false);
  };

  const handleSaveAnamnesis = async (data: AnamnesisData) => {
    if (!client) return;

    const updatedProfileData = {
      ...client.profile_data,
      anamnesis: data,
    };

    const { error: updateError } = await supabase
      .from('clients')
      .update({ profile_data: updatedProfileData })
      .eq('id', clientId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await loadClientData();
  };

  const handleDeleteAnamnesis = async () => {
    if (!confirm('Möchten Sie die Anamnese wirklich löschen?')) return;

    if (!client) return;

    const { anamnesis, ...restProfileData } = client.profile_data || {};

    const { error: updateError } = await supabase
      .from('clients')
      .update({ profile_data: restProfileData })
      .eq('id', clientId);

    if (updateError) {
      setError(updateError.message);
    } else {
      await loadClientData();
    }
  };

  const handleSaveReport = async (formData: ReportFormData) => {
    let finalContent = formData.content;
    let finalTitle = formData.title;

    // Smart generation for interim/final reports if content exists
    if ((formData.reportType === 'interim' || formData.reportType === 'final') && formData.content) {
      try {
        const generateResponse = await fetch('/api/generate-report-smart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reportType: formData.reportType,
            clientId,
            transcript: formData.content,
            existingContent: editingReport?.content || '',
          }),
        });

        if (generateResponse.ok) {
          const { content: generatedContent } = await generateResponse.json();
          finalContent = generatedContent;
          finalTitle = formData.title || (formData.reportType === 'interim' ? 'Zwischenbericht' : 'Abschlussbericht');
        }
      } catch (err) {
        // Fallback: Use user's content as-is
        console.error('Smart generation failed, using user content:', err);
      }
    }

    // Ensure title is set
    if (!finalTitle) {
      finalTitle = formData.reportType === 'anamnese' ? 'Anamnese-Bericht' : 
                   formData.reportType === 'interim' ? 'Zwischenbericht' : 'Abschlussbericht';
    }

    if (editingReport) {
      // Update existing report
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          report_type: formData.reportType,
          title: finalTitle,
          content: finalContent,
          metadata: { 
            rawTranscript: editingReport.metadata?.rawTranscript 
              ? `${editingReport.metadata.rawTranscript}\n\n---\n\n${formData.rawTranscript}`
              : formData.rawTranscript 
          },
        })
        .eq('id', editingReport.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      // Create new report
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          client_id: clientId,
          report_type: formData.reportType,
          title: finalTitle,
          content: finalContent,
          metadata: { rawTranscript: formData.rawTranscript },
          created_by: user?.id,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    setOpenReportDialog(false);
    setEditingReport(null);
    await loadClientData();
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Möchten Sie diesen Termin wirklich löschen?')) return;

    setDeletingId(sessionId);
    try {
      const { error: deleteError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (deleteError) {
        setError(deleteError.message);
      } else {
        await loadClientData();
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen');
    }
    setDeletingId(null);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Möchten Sie diesen Bericht wirklich löschen?')) return;

    setDeletingId(reportId);
    try {
      const { error: deleteError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (deleteError) {
        setError(deleteError.message);
      } else {
        await loadClientData();
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen');
    }
    setDeletingId(null);
  };

  const handleGenerateReport = async (reportType: 'anamnese' | 'interim' | 'final') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          clientId,
          clientName: client?.name,
          sessions: sessions.map((s) => ({
            session_date: s.session_date,
            current_status: s.current_status,
            actions_taken: s.actions_taken,
            next_steps: s.next_steps,
            network_involvement: s.network_involvement,
          })),
          profileData: client?.profile_data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Generieren des Berichts');
      }

      // Save report
      await supabase.from('reports').insert({
        client_id: clientId,
        report_type: reportType,
        title: data.title,
        content: data.content,
        created_by: user?.id,
      });

      loadClientData();
      setTabValue(2); // Switch to reports tab
    } catch (err: any) {
      setError(err.message || 'Fehler beim Generieren des Berichts');
    }

    setLoading(false);
  };

  if (!client) {
    return <Typography>Lädt...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => router.push('/dashboard/clients')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">{client.name}</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Übersicht" />
          <Tab label={`Termine (${sessions.length})`} />
          <Tab label={`Berichte (${reports.length})`} />
        </Tabs>
        
        {tabValue === 1 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenSessionDialog(true)}
          >
            Neuer Termin
          </Button>
        )}
        
        {tabValue === 2 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenReportDialog(true)}
          >
            Neuer Bericht
          </Button>
        )}
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profildaten
                </Typography>
                {client.profile_data && Object.keys(client.profile_data).length > 0 ? (
                  <Box>
                    {Object.entries(client.profile_data).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {key}:
                        </Typography>
                        <Typography variant="body1">{String(value)}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">Keine zusätzlichen Profildaten</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Aktionen
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Anamnese VOR Terminen */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant={client.profile_data?.anamnesis ? 'outlined' : 'contained'}
                      startIcon={<DescriptionIcon />}
                      onClick={() => setOpenAnamnesisDialog(true)}
                      color={client.profile_data?.anamnesis ? 'primary' : 'success'}
                      fullWidth
                    >
                      {client.profile_data?.anamnesis ? 'Anamnese bearbeiten' : 'Anamnese erstellen'}
                    </Button>
                    {client.profile_data?.anamnesis && (
                      <IconButton
                        color="error"
                        onClick={handleDeleteAnamnesis}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenSessionDialog(true)}
                  >
                    Neuer Termin
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DescriptionIcon />}
                    onClick={() => setOpenReportDialog(true)}
                  >
                    Bericht erstellen
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Gesprächstermine</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenSessionDialog(true)}
              >
                Neuer Termin
              </Button>
            </Box>

            {sessions.length === 0 ? (
              <Typography color="text.secondary">Noch keine Termine vorhanden</Typography>
            ) : (
              <List>
                {sessions.map((session) => (
                  <ListItem key={session.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          {new Date(session.session_date).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setEditingSession(session);
                              setTranscript('');
                              setOpenSessionDialog(true);
                            }}
                            disabled={deletingId === session.id}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={deletingId === session.id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Aktueller Stand:</strong> {session.current_status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Aktionen:</strong> {session.actions_taken}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Nächste Schritte:</strong> {session.next_steps}
                      </Typography>
                      {session.network_involvement && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Netzwerk:</strong> {session.network_involvement}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Berichte
            </Typography>

            {reports.length === 0 ? (
              <Typography color="text.secondary">Noch keine Berichte vorhanden</Typography>
            ) : (
              <List>
                {reports.map((report) => (
                  <ListItem key={report.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Typography variant="subtitle1">{report.title}</Typography>
                          <Chip
                            label={
                              report.report_type === 'anamnese'
                                ? 'Anamnese'
                                : report.report_type === 'interim'
                                ? 'Zwischenbericht'
                                : 'Abschlussbericht'
                            }
                            size="small"
                            color="primary"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setEditingReport(report);
                              setOpenReportDialog(true);
                            }}
                            disabled={deletingId === report.id}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={deletingId === report.id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(report.created_at).toLocaleDateString('de-DE')}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                        {report.content}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={openSessionDialog} onClose={() => {
        setOpenSessionDialog(false);
        setEditingSession(null);
        setTranscript('');
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSession ? 'Termin ergänzen/aktualisieren' : 'Neuen Termin protokollieren'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {editingSession && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Sie bearbeiten einen bestehenden Termin. Ihre neuen Notizen werden mit den vorhandenen Informationen zusammengeführt.
              </Alert>
            )}

            {editingSession && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Bestehende Daten:</Typography>
                <Typography variant="body2"><strong>Status:</strong> {editingSession.current_status}</Typography>
                <Typography variant="body2"><strong>Aktionen:</strong> {editingSession.actions_taken}</Typography>
                <Typography variant="body2"><strong>Nächste Schritte:</strong> {editingSession.next_steps}</Typography>
                {editingSession.network_involvement && (
                  <Typography variant="body2"><strong>Netzwerk:</strong> {editingSession.network_involvement}</Typography>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              type="date"
              label="Termin-Datum"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              helperText="Standard ist das aktuelle Datum"
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={isRecording ? stopRecording : startRecording}
                size="large"
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {isRecording ? 'Aufnahme läuft...' : editingSession ? 'Ergänzen Sie weitere Notizen per Mikrofon' : 'Klicken Sie auf das Mikrofon für Spracheingabe'}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Gesprächsnotizen"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={editingSession ? 'Ergänzen Sie weitere Informationen...' : 'Beschreiben Sie den aktuellen Stand, vorgenommene Aktionen, nächste Schritte und Netzwerkeinbezug...'}
              helperText={editingSession ? 'Ihre Ergänzungen werden mit den bestehenden Daten zusammengeführt.' : 'Die KI wird die Informationen automatisch in die richtigen Felder einordnen.'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenSessionDialog(false);
            setEditingSession(null);
            setTranscript('');
          }}>Abbrechen</Button>
          <Button onClick={handleCreateSession} variant="contained" disabled={loading}>
            {loading ? (editingSession ? 'Aktualisiert...' : 'Erstelle...') : (editingSession ? 'Änderungen speichern' : 'Termin speichern')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Anamnesis Dialog */}
      <AnamnesisDialog
        open={openAnamnesisDialog}
        onClose={() => setOpenAnamnesisDialog(false)}
        onSave={handleSaveAnamnesis}
        initialData={client?.profile_data?.anamnesis}
        clientName={client?.name || ''}
      />

      {/* Report Dialog */}
      <ReportDialog
        open={openReportDialog}
        onClose={() => {
          setOpenReportDialog(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
        clientName={client?.name || ''}
        clientId={clientId}
        initialData={editingReport ? {
          reportType: editingReport.report_type as 'anamnese' | 'interim' | 'final',
          title: editingReport.title,
          content: editingReport.content,
          rawTranscript: editingReport.metadata?.rawTranscript || '',
        } : undefined}
      />
    </Box>
  );
}
