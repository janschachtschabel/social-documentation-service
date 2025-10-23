'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import { supabase } from '@/lib/supabase';

interface Report {
  id: string;
  client_id: string;
  report_type: string;
  title: string;
  content: string;
  created_at: string;
  clients: {
    name: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState('all');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, reportTypeFilter]);

  const loadReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        clients (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setReports(data as any);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchQuery) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.clients.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (reportTypeFilter !== 'all') {
      filtered = filtered.filter((report) => report.report_type === reportTypeFilter);
    }

    setFilteredReports(filtered);
  };

  const handlePrint = (report: Report) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1976d2; }
              .meta { color: #666; margin-bottom: 20px; }
              .content { white-space: pre-wrap; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${report.title}</h1>
            <div class="meta">
              <p><strong>Klient:</strong> ${report.clients.name}</p>
              <p><strong>Typ:</strong> ${
                report.report_type === 'anamnese'
                  ? 'Anamnese'
                  : report.report_type === 'interim'
                  ? 'Zwischenbericht'
                  : 'Abschlussbericht'
              }</p>
              <p><strong>Erstellt am:</strong> ${new Date(report.created_at).toLocaleDateString('de-DE')}</p>
            </div>
            <div class="content">${report.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = (report: Report) => {
    const content = `${report.title}\n\nKlient: ${report.clients.name}\nTyp: ${
      report.report_type === 'anamnese'
        ? 'Anamnese'
        : report.report_type === 'interim'
        ? 'Zwischenbericht'
        : 'Abschlussbericht'
    }\nErstellt am: ${new Date(report.created_at).toLocaleDateString('de-DE')}\n\n${report.content}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Berichte
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Suchen"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Titel oder Klient..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Berichtstyp</InputLabel>
                <Select
                  value={reportTypeFilter}
                  label="Berichtstyp"
                  onChange={(e) => setReportTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">Alle Berichte</MenuItem>
                  <MenuItem value="anamnese">Anamnese</MenuItem>
                  <MenuItem value="interim">Zwischenbericht</MenuItem>
                  <MenuItem value="final">Abschlussbericht</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              Keine Berichte gefunden
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {filteredReports.map((report) => (
            <Card key={report.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{report.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Klient: {report.clients.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(report.created_at).toLocaleDateString('de-DE')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={
                        report.report_type === 'anamnese'
                          ? 'Anamnese'
                          : report.report_type === 'interim'
                          ? 'Zwischenbericht'
                          : 'Abschlussbericht'
                      }
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                  {report.content.length > 500
                    ? `${report.content.substring(0, 500)}...`
                    : report.content}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrint(report)}
                  >
                    Drucken
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(report)}
                  >
                    Herunterladen
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );
}
