import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddTabIcon from 'components/icons/add-tab-icon';
import IconButton from 'components/buttons/icon-button';
import { getFSPluginsMap, IFSPluginDescriptor } from 'plugins/plugin-map';
import { addViewAction } from 'store/features/views/views.slice';
import TreeMenu, { TreeMenuNode } from 'components/menu/tree-menu';
import { IUserPluginConfig, PluginPersistence } from 'elcommander-plugin-sdk';
import { getPluginsByCategory } from 'store/features/preferences/preferences.selectors';
import { RootState } from 'store/root-types';
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
    icon: beItem.pluginDescriptor.klass.pluginOptions.icon,
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
  const fsPlugins = useSelector((state: RootState) =>
    getPluginsByCategory(state, 'fs')
  );
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      // get all possible fsBackends
      const backendsMap = await getFSPluginsMap();

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
  }, [setBackends, fsPlugins]);

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
