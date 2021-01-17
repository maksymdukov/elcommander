import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>((theme) => ({
  toolbarIcon: {
    fill: theme.colors.tertiary,
    width: theme.size.iconButtonScale * 20,
    height: theme.size.iconButtonScale * 20,
  },
}));
