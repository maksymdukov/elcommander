import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import { TABVIEW_GAP } from './tree-view.constants';

export const useStyles = createUseStyles<Theme>(() => ({
  treeViewContainer: {
    padding: '0 1px',
    flex: '1 1 auto',
  },
  tabView: {
    position: 'relative',
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: TABVIEW_GAP,
    paddingRight: TABVIEW_GAP,
  },
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
}));
