import React, { MouseEventHandler, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import clsx from 'clsx';
import { Theme } from '../../theme/jss-theme.provider';

const useStyles = createUseStyles<Theme>((theme) => ({
  button: {
    margin: 0,
    padding: 4,
    width: 'auto',
    overflow: 'visible',
    font: 'inherit',
    lineHeight: 'normal',
    cursor: 'pointer',
    borderRadius: '2px',
    background: (props: ButtonProps) =>
      props.transparent ? 'transparent' : theme.colors[props.color!],
    color: theme.text.colors.primaryInverse,
    border: (props: ButtonProps) => (props.outlined ? `1px solid` : 'none'),
    borderColor: (props: ButtonProps) => theme.colors[props.color!],
    '&:focus': {
      outline: 'none',
    },
    '&:hover': {
      // @ts-ignore
      background: (props: ButtonProps) => theme.colors[`${props.color}Light`],
    },
  },
}));

export interface ButtonProps {
  onClick?: MouseEventHandler;
  className?: string;
  outlined?: boolean;
  transparent?: boolean;
  color?: keyof Theme['colors'];
}

const ButtonRaw: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
> = (props, ref) => {
  const {
    children,
    onClick,
    className,
    transparent,
    outlined,
    color,
    ...rest
  } = props;
  const classes = useStyles(props);
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(classes.button, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

const Button = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(ButtonRaw);

Button.defaultProps = {
  color: 'primary',
  outlined: false,
  transparent: false,
};

export default Button;
