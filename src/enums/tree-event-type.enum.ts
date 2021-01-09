export enum TreeEventType {
  OpenNode = 1,
  CloseNode,
  ItemCursorSelect,
  ItemShiftSelect,
  ItemShiftMouseSelect,
  ItemCtrlSelect,
  LassoSelectStart,
  MoveSelectionMaybeStart,
  MoveSelectionEnter,
  MoveSelectionLeave,
  MoveSelectionFinish,
}
