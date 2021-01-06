import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { TreeNode } from '../../classes/tree-node';
import './entity-label.global.scss';

interface EntityLabelProps {
  onClick: React.DOMAttributes<HTMLDivElement>['onClick'];
  onMouseDown: React.DOMAttributes<HTMLDivElement>['onMouseDown'];
  children: ReactNode;
  node: TreeNode;
}

const EntityLabel: React.FC<EntityLabelProps> = ({
  onClick,
  children,
  node,
  onMouseDown,
}) => {
  return (
    <div
      data-label="label"
      className={clsx(
        'entity-label',
        node.isCursor && 'entity-label--cursor',
        node.isSelected && 'entity-label--selected'
      )}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {children}
      <span className="entity-label__label">{node.name}</span>
    </div>
  );
};

export default EntityLabel;
