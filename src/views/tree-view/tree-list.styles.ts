import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const TABVIEW_BORDER_WIDTH = 2;

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
