import config from '@lusc/eslint-config';

export default [
	...config,
	{
		rules: {
			'unicorn/no-process-exit': 'off',
			'n/no-process-exit': 'off',
		},
	},
];
