import React, { MouseEventHandler, PropsWithChildren } from 'react';
import clsx from 'clsx';
import './menu-item.global.scss';

interface MenuItemProps {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const MenuItemRaw: React.ForwardRefRenderFunction<
  HTMLLIElement,
  PropsWithChildren<MenuItemProps>
> = ({ className, onClick, children, ...rest }, ref) => {
  return (
    <li ref={ref} className={clsx('menu__item', className)} {...rest}>
      <button type="button" className="menu__item__button" onClick={onClick}>
        {children}
      </button>
    </li>
  );
};

const MenuItem = React.forwardRef<
  HTMLLIElement,
  PropsWithChildren<MenuItemProps>
>(MenuItemRaw);

export default MenuItem;
