import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>((theme) => ({
  viewPathContainer: {
    flexGrow: 1,
    overflow: 'auto',
    '&::-webkit-scrollbar': {
      height: 0,
    },
  },
  viewPath: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginLeft: 15,
    padding: '5px 0',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: theme.text.colors.primaryInverse,
  },
  pathBtn: {
    paddingRight: 2,
    paddingLeft: 2,
    '&:hover': {
      background: theme.colors.tertiary,
    },
  },
}));
