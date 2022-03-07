import { DocumentState } from './DocumentState';
import { SessionHistoryEntry } from './SessionHistoryEntry';
import { Traversable } from './Traversable';

export const navigableMap = new Map<symbol, Navigable>();

export class Navigable {
  id = Symbol();
  parent: Navigable | undefined = undefined;
  parentDocumentState: DocumentState | undefined = undefined;
  activeHistoryEntry: SessionHistoryEntry | null = null;

  constructor() {
    navigableMap.set(this.id, this);
  }

  get activeDocState(): DocumentState {
    return this.activeHistoryEntry!.documentState;
  }

  getClosestTraversable(): Traversable {
    let nav: Navigable = this;

    while (nav.parent) {
      nav = nav.parent;
    }

    return nav as Traversable;
  }
}
