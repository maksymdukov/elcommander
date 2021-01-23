import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import { TABVIEW_BORDER_WIDTH } from './tree-view.constants';

export const useStyles = createUseStyles<Theme>((theme) => ({
  treeList: {
    position: 'relative',
    border: `${TABVIEW_BORDER_WIDTH}px solid ${theme.text.colors.secondary}`,
    '&:focus': {
      border: `${TABVIEW_BORDER_WIDTH}px solid ${theme.colors.tertiary}`,
      outline: 'none',
    },
  },
  scrollContainer: {
    overflow: 'hidden',
  },
}));
