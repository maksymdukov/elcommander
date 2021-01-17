import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>(() => ({
  treeViewContainer: {
    padding: '0 1px',
    flex: '1 1 auto',
  },
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
}));
