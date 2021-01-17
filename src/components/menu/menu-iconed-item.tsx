import React, { MouseEventHandler, PropsWithChildren } from 'react';
import MenuItem from './menu-item';
import './menu-iconed-item.global.scss';

interface MenuIconedItemProps {
  icon: React.FC<{ className?: string }>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const MenuIconedItemRaw: React.ForwardRefRenderFunction<
  HTMLLIElement,
  MenuIconedItemProps
> = ({ icon: Icon, onClick, children, ...rest }, ref) => {
  return (
    <MenuItem ref={ref} {...rest} onClick={onClick}>
      <Icon className="menu-iconed-item__icon" />
      <span className="menu-iconed-item__label">{children}</span>
    </MenuItem>
  );
};
const MenuIconedItem = React.forwardRef<
  HTMLLIElement,
  PropsWithChildren<MenuIconedItemProps>
>(MenuIconedItemRaw);
export default MenuIconedItem;
