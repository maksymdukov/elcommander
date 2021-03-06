import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>(() => ({
  treeContainer: {
    flexGrow: 1,
    display: 'flex',
    padding: '0 0 10px',
    flexWrap: 'nowrap',
  },
}));
