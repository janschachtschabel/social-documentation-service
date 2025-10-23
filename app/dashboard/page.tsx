'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

interface DashboardStats {
  totalClients: number;
  totalSessions: number;
  totalReports: number;
  recentSessions: number;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalSessions: 0,
    totalReports: 0,
    recentSessions: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const [clientsResult, sessionsResult, reportsResult] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('sessions').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }),
      ]);

      // Recent sessions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSessionsResult = await supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .gte('session_date', sevenDaysAgo.toISOString());

      setStats({
        totalClients: clientsResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        totalReports: reportsResult.count || 0,
        recentSessions: recentSessionsResult.count || 0,
      });
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Klienten gesamt',
      value: stats.totalClients,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Gesprächstermine',
      value: stats.totalSessions,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
    {
      title: 'Erstellte Berichte',
      value: stats.totalReports,
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Termine (7 Tage)',
      value: stats.recentSessions,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Willkommen, {user?.email}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {user?.role === 'admin' ? 'Administrator-Dashboard' : 'Sozialarbeiter-Dashboard'}
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h3" component="div">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Schnellstart
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Willkommen im KI-gestützten Dokumentationssystem für Sozialarbeiter. Hier können Sie:
        </Typography>
        <ul style={{ paddingLeft: '20px' }}>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Klienten verwalten:</strong> Erstellen Sie neue Klientenprofile mit KI-gestützter
              Spracheingabe
            </Typography>
          </li>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Gesprächstermine protokollieren:</strong> Dokumentieren Sie Termine mit strukturierten
              Feldern (aktueller Stand, Aktionen, nächste Schritte, Netzwerk)
            </Typography>
          </li>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Berichte erstellen:</strong> Generieren Sie automatisch Anamnesen, Zwischen- und
              Endberichte aus Ihren Protokollen
            </Typography>
          </li>
          <li>
            <Typography variant="body2" paragraph>
              <strong>Statistiken ansehen:</strong> Visualisieren Sie Fortschrittsindikatoren wie Finanzen,
              Gesundheit, Bewerbungen, Familie und Kinderfürsorge
            </Typography>
          </li>
        </ul>
      </Paper>
    </Box>
  );
}
