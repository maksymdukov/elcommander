import React from 'react';
import { ThemeProvider } from 'react-jss';
import tinycolor from 'tinycolor2';

const theme = {
  size: {
    iconScale: 1,
    iconButtonScale: 1,
  },
  colors: {
    primary: '#011627',
    primaryLight: '#093755',
    secondary: '#2EC4B6',
    secondaryLight: '#c6fff5',
    tertiary: '#0570C7',
    tertiaryLight: '#8fa2d4',
    error: '#E71D36',
    errorLight: '#ffb3c0',
    warning: '#FF9F1C',
    warningLight: '#f9e1d4',
  },
  background: {
    primary: '#FDFFFC',
    secondary: '#bababa',
  },
  text: {
    colors: {
      primary: '#000',
      primaryInverse: '#fff',
      secondary: '#222222',
      background: '#FDFFFC',
      backgroundInverse: '#FDFFFC',
    },
  },
  tools: {
    darken: (color: string, amount: number) =>
      tinycolor(color).darken(amount).toString(),
  },
};

export type Theme = typeof theme;

const JssThemeProvider: React.FC = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default JssThemeProvider;
