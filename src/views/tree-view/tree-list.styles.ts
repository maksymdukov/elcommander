import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>(({ colors }) => ({
  treeList: {
    '&:focus': {
      outline: `2px solid ${colors.primary}`,
    },
  },
}));
