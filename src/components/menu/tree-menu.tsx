import React, { SVGProps } from 'react';
import Menu, { MenuProps } from './menu';
import MenuIconedItem from './menu-iconed-item';
import MenuItem from './menu-item';

export interface TreeMenuNode<T = any> {
  label: string;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
  value: T;
  children: TreeMenuNode[];
}

interface TreeMenuProps extends MenuProps {
  nodes: TreeMenuNode[];
  onMenuItemClick: (node: TreeMenuNode['value']) => () => void;
}

/*
[
  {
    label: string;
    icon: Icon;
    value: any,
    children: [
      {
        label: string;
        value: any,
        children: []
      }
    ]
  }
]
 */

const TreeMenu: React.FC<TreeMenuProps> = (props) => {
  const {
    opened,
    nodes,
    onClose,
    onMenuItemClick,
    onOpen,
    trigger,
    position,
    on,
  } = props;
  return (
    <Menu
      opened={opened}
      onClose={onClose}
      onOpen={onOpen}
      trigger={trigger}
      position={position || 'bottom left'}
      on={on || 'click'}
      nested
    >
      {nodes.map((item, idx) => {
        const Icon = item.icon;
        if (item.children.length) {
          return (
            <TreeMenu
              key={idx}
              nodes={item.children}
              onMenuItemClick={onMenuItemClick}
              position="right top"
              on="hover"
              trigger={
                Icon ? (
                  <MenuIconedItem key={idx} icon={Icon}>
                    {item.label}
                  </MenuIconedItem>
                ) : (
                  <MenuItem key={idx}>{item.label}</MenuItem>
                )
              }
            />
          );
        }
        return Icon ? (
          <MenuIconedItem
            key={idx}
            icon={Icon}
            onClick={onMenuItemClick(item.value)}
          >
            {item.label}
          </MenuIconedItem>
        ) : (
          <MenuItem key={idx} onClick={onMenuItemClick(item.value)}>
            {item.label}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default TreeMenu;
