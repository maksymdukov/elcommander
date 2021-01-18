import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>((theme) => ({
  addTabItemLabel: {
    marginLeft: theme.size.iconScale * 25 * 10,
  },
}));
