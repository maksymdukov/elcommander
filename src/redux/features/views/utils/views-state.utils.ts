import { v4 } from 'uuid';
import { ViewsState } from '../tree-state.interface';

export class ViewsStateUtils {
  static generateUUID(state: ViewsState) {
    let isUnique = false;
    let uuid: string;
    while (!isUnique) {
      uuid = v4();
      if (state.views.every((view) => view.viewId !== uuid)) {
        isUnique = true;
      }
    }
    return uuid!;
  }
}
