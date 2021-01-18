import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddTabIcon from 'components/icons/add-tab-icon';
import IconButton from 'components/buttons/icon-button';
import { getFSBackendsMap, IFSBackendDescriptor } from 'backends/backends-map';
import { addViewAction } from 'store/features/views/views.slice';
import {
  IUserPluginConfig,
  PluginPersistence,
} from 'plugins/plugin-persistence';
import TreeMenu, { TreeMenuNode } from 'components/menu/tree-menu';
import ToolbarIcon from '../toolbar-icon';

interface BackendItem {
  be: IFSBackendDescriptor;
  configs: IUserPluginConfig[];
  config?: IUserPluginConfig;
}

const generateTree = (beItems: BackendItem[]): TreeMenuNode<BackendItem>[] => {
  return beItems.map((beItem) => ({
    icon: beItem.be.icon,
    label: beItem.be.name,
    children: generateTree(
      beItem.configs.length
        ? [
            {
              be: { ...beItem.be, name: '[NEW]', icon: undefined },
              configs: [],
            },
            ...beItem.configs.map((cnf) => ({
              be: { ...beItem.be, name: cnf.name, icon: undefined },
              configs: [],
              config: cnf,
            })),
          ]
        : []
    ),
    value: beItem,
  }));
};

const AddTab = () => {
  const [backends, setBackends] = useState<TreeMenuNode[]>();
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
      const tree = generateTree(beItems);
      setBackends(tree);
    })();
    // rerun whenever view[].configName changes
  }, [setBackends]);

  const closeMenu = () => {
    setOpened(false);
  };

  const openMenu = () => {
    setOpened(true);
  };

  // TODO delete config

  const onNewTabClick = ({ be, config }: BackendItem) => () => {
    closeMenu();
    // create new tab
    dispatch(addViewAction({ backend: be, config }));
  };

  if (!backends) return null;
  return (
    <TreeMenu
      opened={opened}
      onClose={closeMenu}
      onOpen={openMenu}
      nodes={backends}
      onMenuItemClick={onNewTabClick}
      trigger={
        <IconButton>
          <ToolbarIcon Icon={AddTabIcon} />
        </IconButton>
      }
    />
  );
};

export default AddTab;
