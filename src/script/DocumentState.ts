import { Navigable } from './Navigable';
import { NestedHistory } from './NestedHistory';
import { SessionHistoryEntry } from './SessionHistoryEntry';

export class DocumentState {
  hostNavigable: Navigable;
  nestedHistories: NestedHistory[] = [];

  constructor(hostNavigable: Navigable) {
    this.hostNavigable = hostNavigable;
  }

  isActive(): boolean {
    let docState: DocumentState = this;
    let navigable = this.hostNavigable;

    while (true) {
      if (navigable.activeDocState !== docState) {
        return false;
      }

      if (!navigable.parent) return true;

      docState = navigable.parentDocumentState!;
      navigable = navigable.parent;
    }
  }

  navigate(url: string, { sameDoc = false } = {}) {
    if (!this.isActive()) throw Error('Document is not active');

    const resolvedUrl = new URL(url, this.hostNavigable.activeHistoryEntry!.url)
      .href;

    const traversable = this.hostNavigable.getClosestTraversable();
    const doc = sameDoc ? this : new DocumentState(this.hostNavigable);
    const she = new SessionHistoryEntry(
      resolvedUrl,
      traversable.activeStep + 1,
      doc,
    );

    const entryLists = [traversable.historyEntries];

    // Clear forward history
    for (const entryList of entryLists) {
      for (const entry of entryList) {
        if (entry.step > traversable.activeStep) {
          entryList.delete(entry);
        } else {
          entryLists.push(
            ...entry.documentState.nestedHistories.map((nh) => nh.entries),
          );
        }
      }
    }

    if (this.hostNavigable === traversable) {
      traversable.historyEntries.add(she);
    } else {
      const nestedEntries = traversable.getNestedHistoryForNavigable(
        this.hostNavigable,
      );
      nestedEntries.entries.add(she);
    }

    traversable.applyHistoryStep(she.step);
  }

  go(delta: number) {
    if (!this.isActive()) throw Error('Document is not active');

    const traversable = this.hostNavigable.getClosestTraversable();
    const usedSteps = traversable.getAllUsedSteps();
    const currentStepIndex = usedSteps.indexOf(traversable.activeStep);
    const targetIndex = Math.min(
      usedSteps.length - 1,
      Math.max(0, currentStepIndex + delta),
    );
    const targetStep = usedSteps[targetIndex];
    traversable.applyHistoryStep(targetStep);
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }

  createChildNavigable(url: string) {
    if (!this.isActive()) throw Error('Document is not active');

    const navigable = new Navigable();
    navigable.parentDocumentState = this;
    navigable.parent = this.hostNavigable;

    const resolvedUrl = new URL(url, this.hostNavigable.activeHistoryEntry!.url)
      .href;

    const she = new SessionHistoryEntry(
      resolvedUrl,
      this.hostNavigable.activeHistoryEntry!.step,
      new DocumentState(navigable),
    );
    navigable.activeHistoryEntry = she;

    const nestedHistory = new NestedHistory(navigable.id);
    nestedHistory.entries.add(she);

    this.nestedHistories.push(nestedHistory);

    return navigable;
  }
}
