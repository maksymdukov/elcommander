import React, { useCallback, useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import { ipcRenderer } from 'electron';
import Button from '../../components/buttons/button';

const Preferences = () => {
  const [open, setOpen] = useState(false);
  const openPreferences = useCallback(() => {
    setOpen(true);
  }, [setOpen]);
  const closePreferences = () => setOpen(false);

  useEffect(() => {
    ipcRenderer.on('menu:Settings:Preferences', openPreferences);
    return () => {
      ipcRenderer.off('menu:Settings:Preferences', openPreferences);
    };
  }, [openPreferences]);

  return (
    <Popup
      modal
      open={open}
      closeOnDocumentClick={false}
      onClose={closePreferences}
    >
      <Button onClick={closePreferences}>closePreferences</Button>
      abc
    </Popup>
  );
};

export default Preferences;
