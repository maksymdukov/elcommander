import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
// UI
export const INITIAL_NODE_OFFSET = 15; // px
export const CHILDREN_OFFSET_PX = 26; // px
export const OPENABLE_NODE_TYPES = [FsItemTypeEnum.Directory];

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
