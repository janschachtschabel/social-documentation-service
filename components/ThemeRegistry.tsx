'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { deDE } from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      mode: 'light',
      primary: {
        main: '#1967d2', // Google Blue
        light: '#4285f4',
        dark: '#1557b0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#ea4335', // Google Red
        light: '#ff6659',
        dark: '#c5221f',
        contrastText: '#fff',
      },
      success: {
        main: '#34a853', // Google Green
        light: '#81c995',
        dark: '#0f9d58',
      },
      warning: {
        main: '#fbbc04', // Google Yellow
        light: '#ffd54f',
        dark: '#f9ab00',
      },
      background: {
        default: '#f8f9fa',
        paper: '#ffffff',
      },
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 500,
        fontSize: '2.125rem',
        lineHeight: 1.235,
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1.334,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.43,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12, // Modernere, rundere Ecken wie im Bild
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(0, 0, 0, 0.05)',
      '0px 1px 3px rgba(0, 0, 0, 0.1)',
      '0px 2px 4px rgba(0, 0, 0, 0.1)',
      '0px 3px 6px rgba(0, 0, 0, 0.1)',
      '0px 4px 8px rgba(0, 0, 0, 0.1)',
      '0px 6px 12px rgba(0, 0, 0, 0.1)',
      '0px 8px 16px rgba(0, 0, 0, 0.1)',
      '0px 12px 24px rgba(0, 0, 0, 0.1)',
      '0px 16px 32px rgba(0, 0, 0, 0.1)',
      '0px 20px 40px rgba(0, 0, 0, 0.1)',
      '0px 24px 48px rgba(0, 0, 0, 0.1)',
      '0px 32px 64px rgba(0, 0, 0, 0.12)',
      '0px 40px 80px rgba(0, 0, 0, 0.12)',
      '0px 48px 96px rgba(0, 0, 0, 0.14)',
      '0px 56px 112px rgba(0, 0, 0, 0.14)',
      '0px 64px 128px rgba(0, 0, 0, 0.16)',
      '0px 72px 144px rgba(0, 0, 0, 0.16)',
      '0px 80px 160px rgba(0, 0, 0, 0.18)',
      '0px 88px 176px rgba(0, 0, 0, 0.18)',
      '0px 96px 192px rgba(0, 0, 0, 0.2)',
      '0px 104px 208px rgba(0, 0, 0, 0.2)',
      '0px 112px 224px rgba(0, 0, 0, 0.22)',
      '0px 120px 240px rgba(0, 0, 0, 0.22)',
      '0px 128px 256px rgba(0, 0, 0, 0.24)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            padding: '8px 24px',
            fontSize: '0.875rem',
          },
          contained: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
            '&:hover': {
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.16)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.813rem',
          },
          filled: {
            backgroundColor: '#e8f0fe',
            color: '#1967d2',
            '&:hover': {
              backgroundColor: '#d2e3fc',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1967d2',
              },
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginBottom: 4,
            '&.Mui-selected': {
              backgroundColor: '#e8f0fe',
              color: '#1967d2',
              '&:hover': {
                backgroundColor: '#d2e3fc',
              },
            },
            '&:hover': {
              backgroundColor: '#f1f3f4',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
    },
  },
  deDE
);

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
