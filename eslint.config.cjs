const { defineConfig } = require('eslint/config');

const globals = require('globals');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const prettier = require('eslint-plugin-prettier');

module.exports = defineConfig([
	eslint.configs.recommended,
	...tseslint.configs.recommended,

	{
		settings: {
			react: {
				version: 'detect'
			}
		},
		languageOptions: {
			globals: {
				...globals.browser
			}
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
			prettier
		},

		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			...prettier.configs.recommended.rules,

			'no-unused-vars': 'off',

			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					ignoreRestSiblings: true,
					argsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'warn',

			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react/display-name': 'off',
			'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }]
		}
	},

	{
		files: ['**/*.cjs'],
		languageOptions: {
			globals: {
				...globals.node
			}
		}
	},

	{
		ignores: ['node_modules/', 'dist/', 'build/', 'public/', 'src-tauri/']
	}
]);
