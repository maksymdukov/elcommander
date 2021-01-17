import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddTabIcon from '../../../components/icons/add-tab-icon';
import IconButton from '../../../components/buttons/icon-button';
import {
  getFSBackendsMap,
  IFSBackendDescriptor,
} from '../../../backends/backends-map';
import Menu from '../../../components/menu/menu';
import MenuItem from '../../../components/menu/menu-item';
import MenuIconedItem from '../../../components/menu/menu-iconed-item';
import { addViewAction } from '../../../redux/features/views/views.slice';

import './add-tab.global.scss';
import {
  IUserPluginConfig,
  PluginPersistence,
} from '../../../plugins/plugin-persistence';

interface BackendItem {
  be: IFSBackendDescriptor;
  configs: IUserPluginConfig[];
}

const AddTab = () => {
  const [backends, setBackends] = useState<BackendItem[]>();
  const [opened, setOpened] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      // get all possible fsBackends
      const backendsMap = await getFSBackendsMap();

      // ask each fsBackend what saved config it has
      const backendKeys = Object.keys(backendsMap);
      const savedConfigPromises = backendKeys.map((key) => {
        return PluginPersistence.readPluginConfigs(backendsMap[key].klass);
      });
      const savedConfigs = await Promise.all(savedConfigPromises);

      // merge backends with configs
      const beItems: BackendItem[] = backendKeys
        .map((key, idx) => ({
          be: backendsMap[key],
          configs: savedConfigs[idx],
        }))
        .sort((a, b) => a.be.order - b.be.order);
      setBackends(beItems);
    })();
    // rerun whenever view[].configName changes
  }, [setBackends]);

  const toggleMenu = () => {
    setOpened(!opened);
  };

  const openMenu = () => {
    setOpened(false);
  };

  // TODO delete config

  const onNewTabClick = (
    backend: IFSBackendDescriptor,
    config?: IUserPluginConfig
  ) => () => {
    toggleMenu();
    // create new tab
    dispatch(addViewAction({ backend, config }));
  };

  return (
    <Menu
      opened={opened}
      onClose={openMenu}
      trigger={
        <IconButton onButtonClick={toggleMenu}>
          <AddTabIcon className="add-tab-icon" />
        </IconButton>
      }
      disabled={!backends}
      position="bottom left"
      on="click"
      nested
    >
      {backends?.map((item, idx) => {
        const Icon = item.be.icon;
        if (item.configs.length) {
          return (
            <Menu
              key={idx}
              trigger={
                <MenuIconedItem key={idx} icon={Icon}>
                  {item.be.name}
                </MenuIconedItem>
              }
              position="right top"
              on="hover"
            >
              <MenuItem onClick={onNewTabClick(item.be)}>[New]</MenuItem>
              {item.configs.map((childConfig) => (
                <MenuItem
                  key={childConfig.name}
                  onClick={onNewTabClick(item.be, childConfig)}
                >
                  {childConfig.name}
                </MenuItem>
              ))}
            </Menu>
          );
        }
        return (
          <MenuIconedItem
            key={idx}
            icon={Icon}
            onClick={onNewTabClick(item.be)}
          >
            {item.be.name}
          </MenuIconedItem>
        );
      })}
    </Menu>
  );
};

export default AddTab;
