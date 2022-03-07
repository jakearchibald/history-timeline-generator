import { DocumentState } from './DocumentState';
import { Navigable, navigableMap } from './Navigable';
import { NestedHistory } from './NestedHistory';
import { SessionHistoryEntry } from './SessionHistoryEntry';

function getTargetEntryForStep(
  entries: Set<SessionHistoryEntry>,
  step: number,
) {
  let targetEntry: SessionHistoryEntry | undefined;

  for (const entry of entries) {
    if (entry.step > step) break;
    targetEntry = entry;
    if (entry.step === step) break;
  }

  return targetEntry!;
}

export class Traversable extends Navigable {
  activeStep: number = 0;
  historyEntries = new Set<SessionHistoryEntry>();

  constructor(url: string) {
    super();

    const resolvedUrl = new URL(url, 'https://example.com').href;
    const she = new SessionHistoryEntry(
      resolvedUrl,
      this.activeStep,
      new DocumentState(this),
    );
    this.historyEntries.add(she);
    this.activeHistoryEntry = she;
  }

  applyHistoryStep(step: number) {
    const allUsedSteps = this.getAllUsedSteps();
    let targetStep = -1;

    for (const usedStep of allUsedSteps) {
      if (usedStep > step) break;
      targetStep = usedStep;
      if (usedStep === step) break;
    }

    const navigablesAndEntries = new Set<[Navigable, Set<SessionHistoryEntry>]>(
      [[this, this.historyEntries]],
    );

    // Set active entries
    for (const [navigable, entries] of navigablesAndEntries) {
      const targetEntry = getTargetEntryForStep(entries, targetStep);
      navigable.activeHistoryEntry = targetEntry;

      // Do the same for child navigables
      for (const nestedHistory of targetEntry.documentState.nestedHistories) {
        const navigable = navigableMap.get(nestedHistory.navigableId)!;
        navigablesAndEntries.add([navigable, nestedHistory.entries]);
      }
    }

    this.activeStep = targetStep;
  }

  getAllUsedSteps(): number[] {
    const steps = new Set<number>();
    const entryLists = new Set([this.historyEntries]);

    for (const entryList of entryLists) {
      for (const entry of entryList) {
        steps.add(entry.step);

        for (const nestedHistory of entry.documentState.nestedHistories) {
          entryLists.add(nestedHistory.entries);
        }
      }
    }

    return [...steps].sort((a, b) => a - b);
  }

  getNestedHistoryForNavigable(navigable: Navigable): NestedHistory {
    const documentStates = new Set<DocumentState>();

    for (const entry of this.historyEntries) {
      documentStates.add(entry.documentState);
    }

    for (const documentState of documentStates) {
      for (const nestedHistory of documentState.nestedHistories) {
        if (navigable.id === nestedHistory.navigableId) {
          return nestedHistory;
        }
        for (const entry of nestedHistory.entries) {
          documentStates.add(entry.documentState);
        }
      }
    }

    throw Error('Canot find nested history for navigable');
  }
}
