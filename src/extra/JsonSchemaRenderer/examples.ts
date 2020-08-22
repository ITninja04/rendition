/* eslint-disable no-template-curly-in-string */

export const CONTEXT_FUNCTIONS = {
	fns: {
		prependHello: (input: string) => `Hello ${input}`,
	},
};

const jsonDataExamples = {
	'A string': {
		value: 'A string value',
		schema: {
			type: 'string',
			title: 'Field title',
			description: 'Field description',
		},
		uiSchema: {
			'ui:widget': 'Txt',
			'ui:options': {
				bold: false,
				italic: false,
				monospace: false,
				caps: false,
				align: 'left',
				whitespace: 'normal',
			},
		},
	},
	'A number': {
		value: 4.5,
		schema: {
			type: 'number',
			title: 'Field title',
			description: 'Field description',
		},
		uiSchema: {},
	},
	'An integer': {
		value: 5000,
		schema: {
			type: 'integer',
			title: 'Field title',
			description: 'Field description',
		},
		uiSchema: {},
	},
	'A boolean': {
		value: true,
		schema: {
			type: 'boolean',
			title: 'Field title',
			description: 'Field description',
		},
		uiSchema: {
			'ui:options': {
				label: 'The label',
				reverse: false,
				toggle: false,
			},
		},
	},
	'A null object': {
		value: null,
		schema: {
			type: 'null',
			title: 'Field title',
			description: 'Field description',
		},
		uiSchema: {
			'ui:widget': 'Txt',
		},
	},
	'An array of strings field': {
		value: ['item 1', 'item 2', 'item 3'],
		schema: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		uiSchema: {
			items: {
				'ui:widget': 'Badge',
			},
		},
	},
	'An invalid value': {
		value: {
			eh: 'what',
		},
		schema: {
			type: 'number',
			title: 'Field title',
			description: 'Field description',
		},
		uiSchema: {},
	},
	'A hidden field': {
		value: {
			hidden: 'This should be hidden',
			shown: 'This should be shown',
		},
		schema: {
			type: 'object',
			properties: {
				hidden: {
					type: 'string',
				},
				shown: {
					type: 'string',
				},
			},
		},
		uiSchema: {
			hidden: null,
		},
	},
	'A hidden title': {
		value: 'No title shown',
		schema: {
			type: 'string',
			title: 'This should be hidden',
		},
		uiSchema: {
			'ui:title': null,
		},
	},
	'An object with various properties': {
		value: {
			aString: 'The string value',
			aNumber: 12.345,
			anInteger: 5000,
			aBoolean: false,
			aNull: null,
		},
		schema: {
			type: 'object',
			title: 'Field title',
			description: 'Field description',
			properties: {
				aString: {
					type: 'string',
					title: 'A String Field',
				},
				aNumber: {
					type: 'number',
					title: 'A Number Field',
				},
				anInteger: {
					type: 'integer',
					title: 'An Integer Field',
				},
				aBoolean: {
					type: 'boolean',
					title: 'A Boolean Field',
				},
				aNull: {
					type: 'null',
					title: 'A Null Field',
				},
			},
		},
		uiSchema: {
			aString: {
				'ui:widget': 'Txt',
			},
			aNumber: {
				'ui:widget': 'Txt',
			},
			anInteger: {
				'ui:widget': 'Txt',
			},
			aBoolean: {
				'ui:widget': 'Checkbox',
			},
			aNull: {
				'ui:widget': 'Txt',
			},
		},
	},
	'Re-ordered fields': {
		value: {
			fieldA: 'field A value',
			fieldB: 'field B value',
			fieldC: 'field C value',
		},
		schema: {
			type: 'object',
			properties: {
				fieldA: {
					type: 'string',
				},
				fieldB: {
					type: 'string',
				},
				fieldC: {
					type: 'string',
				},
			},
		},
		uiSchema: {
			'ui:order': ['fieldB', 'fieldC', 'fieldA'],
		},
	},
	'A truncated string': {
		value:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ut facilisis urna. Suspendisse ullamcorper, velit ut auctor vulputate, nibh sem finibus ipsum, vel bibendum tellus nulla non nunc. In porta velit odio. Vivamus nibh dolor, bibendum vel velit sit amet, suscipit lobortis leo. Donec tempus justo non nisi pulvinar, vitae fringilla ligula aliquam. Proin efficitur tellus ac tincidunt iaculis. Duis mattis urna quis libero feugiat, nec pretium felis ornare.',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Txt',
			'ui:options': {
				truncate: true,
			},
		},
	},
	'A truncated array of strings field': {
		value: ['item 1', 'item 2', 'item 3', 'item 4', 'item 5', 'item 6'],
		schema: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		uiSchema: {
			'ui:options': {
				truncate: 4,
			},
		},
	},
	'A string-interpolated value': {
		value: 4,
		schema: {
			type: 'number',
			title: 'Mentions',
		},
		uiSchema: {
			'ui:value': '${source} mentions',
		},
	},
	'An evaluated value': {
		value: 2,
		schema: {
			type: 'number',
			title: 'Number of owners',
		},
		uiSchema: {
			'ui:title': 'Multiple owners?',
			'ui:widget': 'Checkbox',
			'ui:value': {
				$eval: 'source > 1',
			},
		},
	},
	'Using context functions': {
		value: 'Jellyfish',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:value': {
				$eval: 'fns.prependHello(source)',
			},
		},
	},
	'A materialized field': {
		value: {
			firstName: 'John',
			lastName: 'Smith',
		},
		schema: {
			type: 'object',
			properties: {
				firstName: {
					type: 'string',
				},
				lastName: {
					type: 'string',
				},
			},
		},
		uiSchema: {
			firstName: null,
			lastName: null,
			'ui:field:fullName': {
				'ui:title': 'Name',
				'ui:widget': 'Txt',
				'ui:value': '${root.firstName} ${root.lastName}',
			},
		},
	},
	'A badge widget': {
		value: 'closed',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Badge',
			'ui:options': {
				shade: 4,
			},
		},
	},
	'A button widget': {
		value: 'issue',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Button',
			'ui:options': {
				href: 'http://jel.ly.fish/${source}',
				target: '_blank',
				disabled: false,
				primary: true,
				secondary: false,
				tertiary: false,
				quarternary: false,
				danger: false,
				warning: false,
				success: false,
				info: false,
				light: false,
				outline: false,
				plain: false,
				underline: false,
			},
		},
	},
	'A button group widget': {
		value: ['item 1', 'item 2', 'item 3'],
		schema: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		uiSchema: {
			'ui:widget': 'ButtonGroup',
			'ui:options': {
				disabled: false,
				primary: true,
				secondary: false,
				tertiary: false,
				quarternary: false,
				danger: false,
				warning: false,
				success: false,
				info: false,
				light: false,
				outline: false,
				plain: false,
				underline: false,
			},
		},
	},
	'A drop-down button widget': {
		value: ['Action 1', 'Action 2', 'Action 3'],
		schema: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		uiSchema: {
			'ui:widget': 'DropDownButton',
			'ui:options': {
				label: 'Actions',
				disabled: false,
				primary: true,
				secondary: false,
				tertiary: false,
				quarternary: false,
				danger: false,
				warning: false,
				success: false,
				info: false,
				light: false,
				outline: false,
				plain: false,
				underline: false,
			},
		},
	},
	'A Link widget': {
		value: 'lEIoUMKY',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Link',
			'ui:value': 'View trello board',
			'ui:options': {
				blank: true,
				href: 'https://trello.com/b/${source}',
			},
		},
	},
	'An Img widget': {
		value: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Jelly_cc11.jpg',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Img',
			'ui:options': {
				width: 200,
				alt: 'Jellyfish',
			},
		},
	},
	'A Tag widget': {
		value: 'premium',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Tag',
			'ui:options': {
				name: 'subscription',
			},
		},
	},
	'A HighlightedName widget': {
		value: 'Jellyfish',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'HighlightedName',
			'ui:options': {
				bg: '#222',
				color: 'white',
			},
		},
	},
	'A Heading widget': {
		value: 'Something Important',
		schema: {
			type: 'string',
		},
		uiSchema: {
			'ui:widget': 'Heading',
			'ui:options': {
				size: 2,
			},
		},
	},
	'A Markdown widget': {
		value: '# Something Important\n## Something less important',
		schema: {
			type: 'string',
			format: 'markdown',
		},
		uiSchema: {
			'ui:widget': 'Markdown',
		},
	},
	'A List widget': {
		value: ['user', 'org', 'issue'],
		schema: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		uiSchema: {
			'ui:widget': 'List',
			'ui:options': {
				ordered: true,
			},
			items: {
				'ui:widget': 'Link',
				'ui:options': {
					href: 'https://jel.ly.fish/${source}',
				},
			},
		},
	},
};

export default jsonDataExamples;
