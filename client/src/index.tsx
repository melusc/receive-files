import React from 'react';
// eslint-disable-next-line n/file-extension-in-import
import {createRoot} from 'react-dom/client';

import {App} from './components/app';

const root = createRoot(document.querySelector('#root')!);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
