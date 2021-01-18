import React from 'react';
import Popup from 'reactjs-popup';
import { PopupProps } from 'reactjs-popup/dist/types';
import clsx from 'clsx';
import { createUseStyles } from 'react-jss';
import { Theme } from 'theme/jss-theme.provider';
import 'reactjs-popup/dist/index.css';

export interface MenuProps {
  trigger: JSX.Element;
  on?: PopupProps['on'];
  disabled?: PopupProps['disabled'];
  position?: PopupProps['position'];
  menuClassName?: string;
  nested?: boolean;
  opened?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

const useStyles = createUseStyles<Theme>((theme) => ({
  menu: {
    background: theme.background.primary,
    boxShadow: '0px 8px 24px 0px rgba(149, 157, 165, 0.2)',
    margin: 0,
    padding: 0,
    textIndex: 0,
    listStyle: 'none',
  },
  popupContent: {
    '&-content': {
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: 6,
      overflow: 'hidden',
    },
  },
}));

const Menu: React.FC<MenuProps> = ({
  trigger,
  position = 'right top',
  disabled,
  menuClassName,
  onClose,
  onOpen,
  on,
  opened,
  nested,
  children,
}) => {
  const classes = useStyles();
  return (
    <Popup
      onOpen={onOpen}
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
      className={classes.popupContent}
    >
      <ul className={clsx(classes.menu, menuClassName)}>{children}</ul>
    </Popup>
  );
};

export default Menu;
