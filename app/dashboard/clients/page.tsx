'use client';

import { useEffect, useState } from 'react';
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
  IconButton,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Mic as MicIcon,
  Stop as StopIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  profile_data: any;
  created_at: string;
  session_count?: number;
  report_count?: number;
  last_session?: string;
}

export default function ClientsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [clients, setClients] = useState<Client[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [deletingClient, setDeletingClient] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Lade zusätzliche Statistiken für jeden Klienten
      const clientsWithStats = await Promise.all(
        data.map(async (client) => {
          // Anzahl Sessions
          const { count: sessionCount } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);

          // Anzahl Berichte
          const { count: reportCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id);

          // Letzter Termin
          const { data: lastSession } = await supabase
            .from('sessions')
            .select('session_date')
            .eq('client_id', client.id)
            .order('session_date', { ascending: false })
            .limit(1)
            .single();

          return {
            ...client,
            session_count: sessionCount || 0,
            report_count: reportCount || 0,
            last_session: lastSession?.session_date || null,
          };
        })
      );

      setClients(clientsWithStats);
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
        setAudioChunks([]);
        
        // For now, we'll use manual transcript since we can't directly call OpenAI from client
        // In production, this should go through an API route
        setTranscript('Bitte geben Sie die Klientendaten manuell ein oder verwenden Sie die API-Route für Transkription.');
      };

      setMediaRecorder(recorder);
      setAudioChunks([]);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Mikrofon-Zugriff verweigert');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Möchten Sie den Klienten "${clientName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    setDeletingClient(clientId);
    try {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (deleteError) {
        setError(deleteError.message);
      } else {
        loadClients();
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen');
    }
    setDeletingClient(null);
  };

  const handleCreateClient = async () => {
    if (!transcript.trim()) {
      setError('Bitte geben Sie Klientendaten ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse the transcript via API route (secure!)
      const response = await fetch('/api/parse-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const parsed = await response.json();

      if (!response.ok) {
        throw new Error(parsed.error || 'Fehler beim Parsen');
      }

      if (!parsed.name) {
        setError('Name ist erforderlich');
        setLoading(false);
        return;
      }

      // Create client
      const { data, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: parsed.name,
          profile_data: parsed.profile_data,
          created_by: user?.id,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else {
        setOpenDialog(false);
        setTranscript('');
        loadClients();
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen des Klienten');
    }

    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Klienten</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/dashboard/clients/new')}
        >
          Neuer Klient
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Profil</TableCell>
              <TableCell align="center">Termine</TableCell>
              <TableCell align="center">Berichte</TableCell>
              <TableCell>Letzter Termin</TableCell>
              <TableCell>Erstellt am</TableCell>
              <TableCell align="right">Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    Noch keine Klienten vorhanden
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="action" fontSize="small" />
                      <Typography variant="body2" fontWeight={500}>
                        {client.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {client.profile_data && Object.keys(client.profile_data).length > 0 ? (
                      <Chip label="Vollständig" size="small" color="success" />
                    ) : (
                      <Chip label="Unvollständig" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<EventIcon />}
                      label={client.session_count || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={client.report_count || 0} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {client.last_session
                        ? new Date(client.last_session).toLocaleDateString('de-DE')
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(client.created_at).toLocaleDateString('de-DE')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Details ansehen">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/clients/${client.id}`);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {user?.role === 'admin' && (
                        <Tooltip title="Klient löschen">
                          <IconButton
                            size="small"
                            color="error"
                            disabled={deletingClient === client.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client.id, client.name);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Neuen Klienten anlegen</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <IconButton
                color={isRecording ? 'error' : 'primary'}
                onClick={isRecording ? stopRecording : startRecording}
                size="large"
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {isRecording
                  ? 'Aufnahme läuft... Klicken Sie erneut, um zu stoppen'
                  : 'Klicken Sie auf das Mikrofon, um die Spracheingabe zu starten'}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Klientendaten (Name erforderlich)"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Z.B.: Der Klient heißt Max Mustermann, 35 Jahre alt, lebt in einer 2-Zimmer-Wohnung..."
              helperText="Geben Sie die Klientendaten ein. Die KI wird den Namen und weitere Informationen extrahieren."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button onClick={handleCreateClient} variant="contained" disabled={loading}>
            {loading ? 'Erstelle...' : 'Klient anlegen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
