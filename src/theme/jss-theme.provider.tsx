import React from 'react';
import { ThemeProvider } from 'react-jss';

const theme = {
  size: {
    iconScale: 1,
    iconButtonScale: 1,
  },
  colors: {
    primary: '#011627',
    secondary: '#2EC4B6',
    tertiary: '#0570C7',
    error: '#E71D36',
    warning: '#FF9F1C',
  },
  background: {
    primary: '#FDFFFC',
  },
  text: {
    colors: {
      primary: '#000',
      primaryInverse: '#fff',
      background: '#FDFFFC',
      backgroundInverse: '#FDFFFC',
    },
  },
};

export type Theme = typeof theme;

const JssThemeProvider: React.FC = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default JssThemeProvider;
