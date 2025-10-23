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
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { createUser } from '@/lib/auth';

interface Profile {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

export default function UsersPage() {
  const user = useAuthStore((state) => state.user);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'social_worker'>('social_worker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      return;
    }
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      setError('E-Mail und Passwort sind erforderlich');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const result = await createUser(email, password, role, fullName || undefined);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Benutzer erfolgreich erstellt');
      setOpenDialog(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('social_worker');
      loadProfiles();
    }

    setLoading(false);
  };

  if (user?.role !== 'admin') {
    return (
      <Box>
        <Alert severity="error">
          Sie haben keine Berechtigung, auf diese Seite zuzugreifen.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Benutzerverwaltung</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
          Neuer Benutzer
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          {profiles.length === 0 ? (
            <Typography color="text.secondary" align="center">
              Keine Benutzer vorhanden
            </Typography>
          ) : (
            <List>
              {profiles.map((profile) => (
                <ListItem key={profile.id}>
                  <ListItemText
                    primary={profile.full_name || profile.email}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary">
                          {profile.email}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2" color="text.secondary">
                          Erstellt am {new Date(profile.created_at).toLocaleDateString('de-DE')}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={profile.role === 'admin' ? 'Administrator' : 'Sozialarbeiter'}
                    color={profile.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Hinweis: Verwenden Sie keine example.com Domain. Nutzen Sie eine echte Domain oder test.local"
            />

            <TextField
              fullWidth
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              helperText="Mindestens 6 Zeichen"
            />

            <TextField
              fullWidth
              label="Vollständiger Name (optional)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Rolle</InputLabel>
              <Select value={role} label="Rolle" onChange={(e) => setRole(e.target.value as any)}>
                <MenuItem value="social_worker">Sozialarbeiter</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={loading}>
            {loading ? 'Erstelle...' : 'Benutzer anlegen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
