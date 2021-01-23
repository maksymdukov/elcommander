import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddTabIcon from 'components/icons/add-tab-icon';
import IconButton from 'components/buttons/icon-button';
import { getFSBackendsMap, IFSPluginDescriptor } from 'backends/backends-map';
import { addViewAction } from 'store/features/views/views.slice';
import {
  IUserPluginConfig,
  PluginPersistence,
} from 'plugins/plugin-persistence';
import TreeMenu, { TreeMenuNode } from 'components/menu/tree-menu';
import ToolbarIcon from '../toolbar-icon';

interface IFSPluginItem {
  pluginDescriptor: IFSPluginDescriptor;
  configs: IUserPluginConfig[];
  config?: IUserPluginConfig;
}

const generateTree = (
  pluginItems: IFSPluginItem[]
): TreeMenuNode<IFSPluginItem>[] => {
  return pluginItems.map((beItem) => ({
    icon: beItem.pluginDescriptor.icon,
    label: beItem.pluginDescriptor.name,
    children: generateTree(
      beItem.configs.length
        ? [
            {
              pluginDescriptor: {
                ...beItem.pluginDescriptor,
                name: '[NEW]',
                icon: undefined,
              },
              configs: [],
            },
            ...beItem.configs.map((cnf) => ({
              pluginDescriptor: {
                ...beItem.pluginDescriptor,
                name: cnf.name,
                icon: undefined,
              },
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
      const pluginItems: IFSPluginItem[] = backendKeys
        .map((key, idx) => ({
          pluginDescriptor: backendsMap[key],
          configs: savedConfigs[idx],
        }))
        .sort((a, b) => a.pluginDescriptor.order - b.pluginDescriptor.order);
      const tree = generateTree(pluginItems);
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

  const onNewTabClick = ({ pluginDescriptor, config }: IFSPluginItem) => () => {
    closeMenu();
    // create new tab
    dispatch(
      addViewAction({ backend: pluginDescriptor, config: config?.name })
    );
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
