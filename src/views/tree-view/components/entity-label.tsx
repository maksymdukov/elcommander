import React, { ReactNode } from 'react';
import clsx from 'clsx';
import './entity-label.global.scss';
import { TreeNode } from '../../../interfaces/node.interface';

interface EntityLabelProps {
  onClick?: React.DOMAttributes<HTMLDivElement>['onClick'];
  onMouseDown?: React.DOMAttributes<HTMLDivElement>['onMouseDown'];
  onMouseUp?: React.DOMAttributes<HTMLDivElement>['onMouseUp'];
  onMouseEnter?: React.DOMAttributes<HTMLDivElement>['onMouseEnter'];
  onMouseLeave?: React.DOMAttributes<HTMLDivElement>['onMouseLeave'];
  onDragEnter: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
  children: ReactNode;
  node: TreeNode;
}

const EntityLabelRaw: React.ForwardRefRenderFunction<
  HTMLDivElement,
  EntityLabelProps
> = (
  {
    onClick,
    children,
    onMouseEnter,
    onMouseLeave,
    onMouseUp,
    node,
    onMouseDown,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
  },
  ref
) => {
  return (
    <div
      ref={ref}
      data-label="label"
      className={clsx(
        'entity-label',
        node.isCursored && 'entity-label--cursor',
        node.isSelected && 'entity-label--selected',
        node.isHighlighted && 'entity-label--highlighted'
      )}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      // draggable="true"
    >
      {children}
      <span className="entity-label__label">{node.name}</span>
    </div>
  );
};

const EntityLabel = React.forwardRef(EntityLabelRaw);

export default EntityLabel;
