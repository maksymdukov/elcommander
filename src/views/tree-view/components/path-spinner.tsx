import React from 'react';
import { useSelector } from 'react-redux';
import { getIsLoadingStartPath } from '../../../redux/features/views/views.selectors';
import { useTreeViewCtx } from '../hook/use-tree-view-ctx.hook';
import { RootState } from '../../../redux/root-types';
import DashSpinner from '../../../components/animated/dash-spinner';
import { useFsManagerCtx } from '../hook/use-fs-manager-ctx.hook';
import './path-spinner.global.scss';

const PathSpinnerRaw = () => {
  const { fsManager } = useFsManagerCtx();
  const viewIndex = useTreeViewCtx();
  const isLoadingPath = useSelector((state: RootState) =>
    getIsLoadingStartPath(state, viewIndex)
  );
  return isLoadingPath && fsManager.options.pathSpinner ? (
    <div className="path-spinner-container">
      <DashSpinner />
      <span>Loading directory...</span>
    </div>
  ) : null;
};

const PathSpinner = React.memo(PathSpinnerRaw);

export default PathSpinner;
