import React, { MouseEventHandler, PropsWithChildren } from 'react';
import clsx from 'clsx';
import './icon-button.global.scss';

interface IconButtonProps {
  className?: string;
  onButtonClick?: MouseEventHandler<HTMLButtonElement>;
}

const IconButtonRaw: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  PropsWithChildren<IconButtonProps>
> = ({ children, onButtonClick, className, ...props }, ref) => {
  return (
    <button
      type="button"
      className={clsx('icon-button', className)}
      ref={ref}
      {...props}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
};

const IconButton = React.forwardRef<
  HTMLButtonElement,
  PropsWithChildren<IconButtonProps>
>(IconButtonRaw);

export default IconButton;
