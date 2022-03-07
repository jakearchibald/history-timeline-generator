import { SessionHistoryEntry } from './SessionHistoryEntry';

export class NestedHistory {
  navigableId: symbol;
  entries = new Set<SessionHistoryEntry>();

  constructor(navigableId: symbol) {
    this.navigableId = navigableId;
  }
}
