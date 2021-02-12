import React from 'react';
import { createUseStyles } from 'react-jss';
import { Theme } from '../../theme/jss-theme.provider';

const useStyles = createUseStyles<Theme>((theme) => ({
  input: {
    height: 0,
    width: 0,
    visibility: 'hidden',
    '&:checked + label': {
      background: theme.colors.secondary,
    },
    '&:checked + label::after': {
      left: ({ size }) => `calc(100% - ${size * 0.15}px)`,
      transform: 'translate(-100%)',
    },
  },
  label: {
    cursor: 'pointer',
    textIndent: -9999,
    width: ({ size }) => size * 2,
    height: ({ size }) => size,
    background: 'grey',
    display: 'block',
    borderRadius: ({ size }) => size * 0.5,
    position: 'relative',
    '&::after': {
      display: 'block',
      content: '""',
      position: 'absolute',
      top: ({ size }) => size * 0.08,
      left: ({ size }) => size * 0.15,
      width: ({ size }) => size * 0.85,
      height: ({ size }) => size * 0.85,
      background: '#fff',
      borderRadius: '100%',
      transition: '0.3s',
    },
  },
}));

interface ToggleProps {
  id: string;
  size?: number;
  title?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = (props) => {
  const { id, checked, onChange, title = '' } = props;
  const classes = useStyles(props);
  return (
    <>
      <input
        checked={checked}
        type="checkbox"
        id={id}
        className={classes.input}
        onChange={(e) => onChange(e.target.checked)}
      />
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label title={title} htmlFor={id} className={classes.label}>
        Toggle
      </label>
    </>
  );
};

Toggle.defaultProps = {
  size: 10,
};

export default Toggle;
