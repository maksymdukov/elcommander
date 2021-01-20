import React, { MouseEventHandler, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import clsx from 'clsx';
import { Theme } from 'theme/jss-theme.provider';

const useStyles = createUseStyles<Theme>((theme) => ({
  button: {
    margin: 0,
    padding: 4,
    width: 'auto',
    overflow: 'visible',
    font: 'inherit',
    lineHeight: 'normal',
    cursor: 'pointer',
    boxShadow:
      '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);',
    borderRadius: 4,
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
      background: (props: ButtonProps) =>
        theme.tools.darken(theme.colors[props.color!], 10),
    },
    '&:active': {
      boxShadow: 'none',
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
    transparent = false,
    outlined = false,
    color = 'primary',
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

export default Button;
