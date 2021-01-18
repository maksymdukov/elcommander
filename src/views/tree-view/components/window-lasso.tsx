import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import classes from './window-lasso.scss';
import { useLassoSelection } from '../hook/use-lasso-selection.hook';
import { useTreeViewCtx } from '../hook/use-tree-view-ctx.hook';
import {
  lassoSelectionAction,
  resetSelectionAction,
} from '../../../store/features/views/actions/tree-selection.actions';
import { useCurrentValue } from '../../../utils/use-current-value.hook';

const WindowLassoRaw: React.FC = () => {
  const viewIndex = useTreeViewCtx();
  // avoid closure in onLassoSelect*
  const currentViewIndex = useCurrentValue(viewIndex);
  const dispatch = useDispatch();

  const onLassoSelect = useCallback(
    (start: number | null, end: number | null, direction: boolean) => {
      // either both are set
      // or
      // null null - means no selection
      if (start !== null && end !== null) {
        dispatch(
          lassoSelectionAction({
            viewIndex: currentViewIndex.current,
            start,
            end,
            direction,
          })
        );
      } else {
        // reset selection
        dispatch(resetSelectionAction({ viewIndex: currentViewIndex.current }));
      }
    },
    [dispatch, currentViewIndex]
  );

  const onLassoSelectStart = useCallback(() => {
    dispatch(resetSelectionAction({ viewIndex: currentViewIndex.current }));
  }, [dispatch, currentViewIndex]);

  const { current, start } = useLassoSelection({
    onLassoSelect,
    onLassoSelectStart,
  });

  return current === null || start === null ? null : (
    <div
      className={classes.Lasso}
      style={{
        top: Math.min(start, current),
        height: current > start ? current - start : start - current,
      }}
    />
  );
};

const WindowLasso = React.memo(WindowLassoRaw);

export default WindowLasso;
