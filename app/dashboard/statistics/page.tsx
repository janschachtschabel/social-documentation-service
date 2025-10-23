'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

interface Client {
  id: string;
  name: string;
}

interface ProgressData {
  date: string;
  finances: number;
  health: number;
  job_applications: number;
  family_situation: number;
  child_welfare: number;
}

const indicatorLabels: { [key: string]: string } = {
  finances: 'Finanzen',
  health: 'Gesundheit',
  job_applications: 'Bewerbungen',
  family_situation: 'Familiensituation',
  child_welfare: 'Kinderfürsorge',
};

export default function StatisticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [averageScores, setAverageScores] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadProgressData(selectedClient);
    }
  }, [selectedClient]);

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .order('name');

    if (data) {
      setClients(data);
      if (data.length > 0) {
        setSelectedClient(data[0].id);
      }
    }
  };

  const loadProgressData = async (clientId: string) => {
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, session_date')
      .eq('client_id', clientId)
      .order('session_date');

    if (!sessions || sessions.length === 0) {
      setProgressData([]);
      setAverageScores({});
      return;
    }

    const { data: indicators } = await supabase
      .from('progress_indicators')
      .select('*')
      .eq('client_id', clientId);

    if (!indicators) {
      setProgressData([]);
      setAverageScores({});
      return;
    }

    // Group indicators by session
    const sessionMap = new Map<string, any>();
    sessions.forEach((session) => {
      sessionMap.set(session.id, {
        date: new Date(session.session_date).toLocaleDateString('de-DE'),
        finances: 0,
        health: 0,
        job_applications: 0,
        family_situation: 0,
        child_welfare: 0,
      });
    });

    indicators.forEach((indicator) => {
      const session = sessionMap.get(indicator.session_id);
      if (session) {
        session[indicator.indicator_type] = indicator.value;
      }
    });

    const chartData = Array.from(sessionMap.values());
    setProgressData(chartData);

    // Calculate average scores
    const averages: { [key: string]: number } = {};
    Object.keys(indicatorLabels).forEach((key) => {
      const values = indicators
        .filter((i) => i.indicator_type === key)
        .map((i) => i.value);
      
      if (values.length > 0) {
        averages[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

    setAverageScores(averages);
  };

  const barChartData = Object.entries(averageScores).map(([key, value]) => ({
    name: indicatorLabels[key],
    score: value,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Statistiken und Fortschrittsindikatoren
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Klient auswählen</InputLabel>
            <Select
              value={selectedClient}
              label="Klient auswählen"
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {progressData.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              Keine Statistikdaten verfügbar. Erstellen Sie Gesprächstermine mit Fortschrittsindikatoren.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Fortschrittsentwicklung über Zeit
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="finances"
                      stroke="#1976d2"
                      name="Finanzen"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke="#2e7d32"
                      name="Gesundheit"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="job_applications"
                      stroke="#ed6c02"
                      name="Bewerbungen"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="family_situation"
                      stroke="#9c27b0"
                      name="Familiensituation"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="child_welfare"
                      stroke="#d32f2f"
                      name="Kinderfürsorge"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Durchschnittliche Bewertungen
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#1976d2" name="Durchschnittswert" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Erläuterung der Indikatoren
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Die Fortschrittsindikatoren werden auf einer Skala von 0-10 bewertet:
                </Typography>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Finanzen:</strong> Finanzielle Stabilität und Situation des Klienten
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Gesundheit:</strong> Körperliche und psychische Gesundheit
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Bewerbungen:</strong> Fortschritt bei der Arbeitssuche und Bewerbungsaktivitäten
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Familiensituation:</strong> Familiäre Verhältnisse und Beziehungen
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Kinderfürsorge:</strong> Versorgung und Betreuung von Kindern
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
