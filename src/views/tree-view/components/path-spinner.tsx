import React from 'react';
import { useSelector } from 'react-redux';
import { getIsLoadingStartPath } from '../../../store/features/views/views.selectors';
import { useTreeViewCtx } from '../hook/use-tree-view-ctx.hook';
import { RootState } from '../../../store/root-types';
import DashSpinner from '../../../components/animated/dash-spinner';
import { useFsPluginCtx } from '../hook/use-fs-manager-ctx.hook';
import './path-spinner.global.scss';

const PathSpinnerRaw = () => {
  const { fsPlugin } = useFsPluginCtx();
  const viewIndex = useTreeViewCtx();
  const isLoadingPath = useSelector((state: RootState) =>
    getIsLoadingStartPath(state, viewIndex)
  );
  return isLoadingPath && fsPlugin.options.pathSpinner ? (
    <div className="path-spinner-container">
      <DashSpinner />
      <span>Loading directory...</span>
    </div>
  ) : null;
};

const PathSpinner = React.memo(PathSpinnerRaw);

export default PathSpinner;
