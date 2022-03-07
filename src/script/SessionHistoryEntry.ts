import { DocumentState } from './DocumentState';

export class SessionHistoryEntry {
  url: string;
  step: number;
  documentState: DocumentState;

  constructor(url: string, step: number, docState: DocumentState) {
    this.url = url;
    this.documentState = docState;
    this.step = step;
  }
}
