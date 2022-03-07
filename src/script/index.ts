import '../styles/iframe.scss';
import { Traversable } from './Traversable';

const traversable = new Traversable('/t-1');
const iframe1 = traversable.activeDocState.createChildNavigable('/i-1-1');
const iframe2 = traversable.activeDocState.createChildNavigable('/i-2-1');

iframe1.activeDocState.navigate('/i-1-2');
iframe2.activeDocState.navigate('/i-2-2');

traversable.activeDocState.navigate('#foo', { sameDoc: true });
traversable.activeDocState.navigate('/t-2');

console.log(traversable);
