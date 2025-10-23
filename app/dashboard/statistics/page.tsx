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
  ToggleButtonGroup,
  ToggleButton,
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

interface DemographicsData {
  ageGroups: { name: string; count: number }[];
  genders: { name: string; count: number }[];
  nationalities: { name: string; count: number }[];
  maritalStatuses: { name: string; count: number }[];
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
  const [demographics, setDemographics] = useState<DemographicsData>({
    ageGroups: [],
    genders: [],
    nationalities: [],
    maritalStatuses: [],
  });
  const [view, setView] = useState<'demographics' | 'progress'>('demographics');

  useEffect(() => {
    loadClients();
    loadDemographics();
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

  const loadDemographics = async () => {
    const { data: allClients } = await supabase
      .from('clients')
      .select('profile_data');

    if (!allClients) return;

    // Age groups
    const ageMap: { [key: string]: number } = {
      'unter 18': 0,
      '18-30': 0,
      '31-50': 0,
      'über 50': 0,
      'Unbekannt': 0,
    };

    // Genders
    const genderMap: { [key: string]: number } = {
      'Männlich': 0,
      'Weiblich': 0,
      'Divers': 0,
      'Keine Angabe': 0,
    };

    // Nationalities (top 5)
    const nationalityMap: { [key: string]: number } = {};

    // Marital status
    const maritalMap: { [key: string]: number } = {};

    allClients.forEach((client) => {
      const data = client.profile_data;
      
      // Age
      if (data?.age) {
        const age = parseInt(data.age);
        if (age < 18) ageMap['unter 18']++;
        else if (age <= 30) ageMap['18-30']++;
        else if (age <= 50) ageMap['31-50']++;
        else ageMap['über 50']++;
      } else {
        ageMap['Unbekannt']++;
      }

      // Gender
      if (data?.gender === 'male') genderMap['Männlich']++;
      else if (data?.gender === 'female') genderMap['Weiblich']++;
      else if (data?.gender === 'diverse') genderMap['Divers']++;
      else genderMap['Keine Angabe']++;

      // Nationality
      if (data?.nationality) {
        nationalityMap[data.nationality] = (nationalityMap[data.nationality] || 0) + 1;
      }

      // Marital Status
      if (data?.maritalStatus) {
        maritalMap[data.maritalStatus] = (maritalMap[data.maritalStatus] || 0) + 1;
      }
    });

    // Convert to chart format
    const ageGroups = Object.entries(ageMap)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));

    const genders = Object.entries(genderMap)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));

    const nationalities = Object.entries(nationalityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const maritalStatuses = Object.entries(maritalMap)
      .map(([name, count]) => ({ name, count }));

    setDemographics({
      ageGroups,
      genders,
      nationalities,
      maritalStatuses,
    });
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, newView) => newView && setView(newView)}
                fullWidth
              >
                <ToggleButton value="demographics">
                  Kunden-Zusammensetzung
                </ToggleButton>
                <ToggleButton value="progress">
                  Fortschritte je Klient
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            {view === 'progress' && (
              <Grid item xs={12} md={6}>
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
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {view === 'demographics' ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Altersverteilung
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demographics.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" name="Anzahl" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Geschlechterverteilung
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demographics.genders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2e7d32" name="Anzahl" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 5 Nationalitäten
                </Typography>
                {demographics.nationalities.length === 0 ? (
                  <Typography color="text.secondary">Keine Daten verfügbar</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographics.nationalities}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ed6c02" name="Anzahl" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Familienstand
                </Typography>
                {demographics.maritalStatuses.length === 0 ? (
                  <Typography color="text.secondary">Keine Daten verfügbar</Typography>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={demographics.maritalStatuses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9c27b0" name="Anzahl" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : progressData.length === 0 ? (
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
