import React, { useEffect, useRef } from 'react';
import { MenuItemConstructorOptions, remote } from 'electron';

const { Menu } = remote;

interface NativeMenuProps {
  template: MenuItemConstructorOptions[] | null;
  onClose: (e: Event) => void;
}

type NativeMenuInst = ReturnType<typeof Menu.buildFromTemplate>;

const NativeMenu: React.FC<NativeMenuProps> = ({ template, onClose }) => {
  const menuRef = useRef<NativeMenuInst | null>(null);

  useEffect(() => {
    if (template === null) {
      menuRef.current?.closePopup();
      menuRef.current = null;
    } else {
      menuRef.current = Menu.buildFromTemplate(template);
      menuRef.current?.popup({ window: remote.getCurrentWindow() });
      menuRef.current?.once('menu-will-close', (e) => {
        menuRef.current = null;
        onClose(e);
      });
    }
  }, [template, onClose]);

  return null;
};

export default NativeMenu;
