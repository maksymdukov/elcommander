import React, { ReactNode } from 'react';
import clsx from 'clsx';
import './entity-label.global.scss';
import { TreeNode } from '../../../interfaces/node.interface';
import TreeSpinner from './tree-spinner';
import { useFsManagerCtx } from '../hook/use-fs-manager-ctx.hook';

interface EntityLabelProps {
  onClick?: React.DOMAttributes<HTMLDivElement>['onClick'];
  onDoubleClick: React.DOMAttributes<HTMLDivElement>['onDoubleClick'];
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
    onDoubleClick,
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
  const { fsManager } = useFsManagerCtx();
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
      onDoubleClick={onDoubleClick}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
    >
      {children}
      <span className="entity-label__label">{node.name}</span>
      {node.isLoading && fsManager.options.treeSpinner && <TreeSpinner />}
    </div>
  );
};

const EntityLabel = React.forwardRef(EntityLabelRaw);

export default EntityLabel;
