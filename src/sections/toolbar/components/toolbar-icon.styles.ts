import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>((theme) => ({
  toolbarIcon: {
    fill: theme.colors.tertiary,
  },
}));
