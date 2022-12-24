import React from 'react';
import {createRoot} from 'react-dom/client.js';

import {App} from './components/App';

const root = createRoot(document.querySelector('#root')!);
root.render(<App />);
