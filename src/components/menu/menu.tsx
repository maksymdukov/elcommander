import React from 'react';
import Popup from 'reactjs-popup';
import { PopupProps } from 'reactjs-popup/dist/types';
import './menu.global.scss';
import clsx from 'clsx';

interface MenuProps {
  trigger: JSX.Element;
  on?: PopupProps['on'];
  disabled?: PopupProps['disabled'];
  position?: PopupProps['position'];
  menuClassName?: string;
  nested?: boolean;
  opened?: boolean;
  onClose?: () => void;
}

const Menu: React.FC<MenuProps> = ({
  trigger,
  position = 'right top',
  disabled,
  menuClassName,
  onClose,
  on,
  opened,
  nested,
  children,
}) => {
  return (
    <Popup
      onClose={onClose}
      open={opened}
      disabled={disabled}
      trigger={trigger}
      on={on}
      position={position}
      arrow={false}
      repositionOnResize
      closeOnDocumentClick
      closeOnEscape
      nested={nested}
    >
      <ul className={clsx('menu', menuClassName)}>{children}</ul>
    </Popup>
  );
};

export default Menu;
