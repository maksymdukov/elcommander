import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';

export const useStyles = createUseStyles<Theme>((theme) => ({
  iconButton: {
    background: 'transparent',
    border: 'none',
    borderRadius: '50%',
    padding: 6,
    transition: 'box-shadow 0.2s',
    lineHeight: 0,
    '&:hover': {
      boxShadow: '0px 0px 5px -2px #000000',
    },
    '&:focus': {
      outline: 'none',
    },
    '& > svg': {
      width: theme.size.iconButtonScale * 24,
      height: theme.size.iconButtonScale * 24,
    },
  },
}));
