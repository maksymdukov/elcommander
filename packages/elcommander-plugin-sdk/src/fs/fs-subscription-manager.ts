export interface FSSubscription<T = any> {
  path: string;
  ctx: T;
}

export interface FsSubscriptionCtorProps<Ctx> {
  onSubRemove: (sub: FSSubscription<Ctx>) => void;
}

export class FsSubscriptionManager<Ctx> {
  private subscriptions: FSSubscription[] = [];

  private readonly onSubRemove: FsSubscriptionCtorProps<Ctx>['onSubRemove'];

  constructor({ onSubRemove }: FsSubscriptionCtorProps<Ctx>) {
    this.onSubRemove = onSubRemove;
  }

  add(sub: FSSubscription) {
    this.subscriptions.push(sub);
  }

  get(path: string) {
    return this.subscriptions.find((sub) => sub.path === path);
  }

  removeNested(path: string) {
    this.subscriptions = this.subscriptions.filter((sub) => {
      if (sub.path.substr(0, path.length) === path) {
        this.onSubRemove(sub);
        return false;
      }
      return true;
    });
  }

  removeAll() {
    this.subscriptions.forEach(this.onSubRemove);
    this.subscriptions = [];
  }
}
