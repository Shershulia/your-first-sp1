import { createTheme } from '@mui/material/styles';

// Общие цвета Succinct
const succinct = {
  pink: {
    main: '#FF1B8D',      // Яркий розовый из лого
    light: '#FF69B4',     // Светлый розовый
    dark: '#CC1771',      // Темный розовый
  },
  blue: {
    main: '#69C9FF',      // Голубой из кепки
    light: '#97DEFF',
    dark: '#5094BD',
  }
};

// Общие стили типографики
const typography = {
  fontFamily: '"Inter", "Arial", sans-serif',
  h1: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 800,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  h3: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 600,
    fontSize: '2.5rem',
    letterSpacing: '0.05em',
  },
  h4: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 600,
  },
  h5: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 500,
  },
  h6: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 500,
  },
  body1: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  body2: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  button: {
    fontFamily: '"Orbitron", sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  caption: {
    fontFamily: '"Inter", sans-serif',
    fontSize: '0.85rem',
  },
  overline: {
    fontFamily: '"Inter", sans-serif',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: succinct.pink.main,
      light: succinct.pink.light,
      dark: succinct.pink.dark,
    },
    secondary: {
      main: succinct.blue.main,
      light: succinct.blue.light,
      dark: succinct.blue.dark,
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
  typography,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(255,27,141,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          padding: '8px 24px',
          letterSpacing: '0.05em',
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${succinct.pink.main} 30%, ${succinct.pink.light} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${succinct.pink.dark} 30%, ${succinct.pink.main} 90%)`,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          '&.cyberpunk-text': {
            textShadow: `2px 2px 0px ${succinct.pink.main}, -2px -2px 0px ${succinct.blue.main}`,
          },
        },
        h2: {
          '&.cyberpunk-text': {
            textShadow: `1px 1px 0px ${succinct.pink.main}, -1px -1px 0px ${succinct.blue.main}`,
          },
        },
        h3: {
          '&.cyberpunk-text': {
            textShadow: `1px 1px 0px ${succinct.pink.main}, -1px -1px 0px ${succinct.blue.main}`,
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: succinct.pink.main,
      light: succinct.pink.light,
      dark: succinct.pink.dark,
    },
    secondary: {
      main: succinct.blue.main,
      light: succinct.blue.light,
      dark: succinct.blue.dark,
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
  },
  typography,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#2D2D2D',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
          '&:hover': {
            boxShadow: '0 12px 24px rgba(255,27,141,0.2)',
            border: `1px solid ${succinct.pink.main}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          padding: '8px 24px',
          letterSpacing: '0.05em',
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${succinct.pink.main} 30%, ${succinct.pink.light} 90%)`,
          '&:hover': {
            background: `linear-gradient(45deg, ${succinct.pink.dark} 30%, ${succinct.pink.main} 90%)`,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          '&.cyberpunk-text': {
            textShadow: `2px 2px 0px ${succinct.pink.main}, -2px -2px 0px ${succinct.blue.main}`,
          },
        },
        h2: {
          '&.cyberpunk-text': {
            textShadow: `1px 1px 0px ${succinct.pink.main}, -1px -1px 0px ${succinct.blue.main}`,
          },
        },
        h3: {
          '&.cyberpunk-text': {
            textShadow: `1px 1px 0px ${succinct.pink.main}, -1px -1px 0px ${succinct.blue.main}`,
          },
        },
      },
    },
  },
}); 