import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
// UI
export const INITIAL_NODE_OFFSET = 15; // px
export const CHILDREN_OFFSET_PX = 26; // px
export const OPENABLE_NODE_TYPES = [FsItemTypeEnum.Directory];
export const PREVIEW_PIC_OFFSET = 15;
// resize
export const MIN_TABVIEW_WIDTH = 10;
export const TABVIEW_BORDER_WIDTH = 2;
export const TABVIEW_GAP = 4;
export const RESIZE_HANDLE_WIDTH =
  (TABVIEW_BORDER_WIDTH + TABVIEW_GAP) * 2 + TABVIEW_BORDER_WIDTH;

// represents top and bottom threshold in container
// when autoscroll starts to kick in
// px
export const AUTOSCROLL_ZONE = 20;

// Speed of autoscroll coefficient
// higher is faster
export const AUTOSCROLL_SPEED_COEF = 0.5;

//
// Drag and drop
//

// Not droppable node types
export const UNDROPPABLE_NODE_TYPES = [FsItemTypeEnum.File];
export const AUTOSCROLL_DND_SPEED = 3;
