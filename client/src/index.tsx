import React from 'react';
import {createRoot} from 'react-dom/client.js';

import {App} from './components/app';

const root = createRoot(document.querySelector('#root')!);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
