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
        node.isSelected && 'entity-label--selected'
      )}
      onDragLeave={(_e) => {
        // for external dnd
        console.log('external leave');
      }}
      onDragEnter={(e) => {
        // for external dnd
        console.log('external enter');
        e.dataTransfer.dropEffect = 'none';
      }}
      onDragOver={(e) => {
        // for external dnd
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        console.log('external drag occurring');
      }}
      onDrop={(_e) => console.log('drop occurred')}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
      draggable="true"
    >
      {children}
      <span className="entity-label__label">{node.name}</span>
    </div>
  );
};

const EntityLabel = React.forwardRef(EntityLabelRaw);

export default EntityLabel;
