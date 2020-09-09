export * from './colorUtils';
export * from './schemaUtils';
export * from './styledUtils';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

export const hashCode = function (text: string, max: number): number {
	let hash = 0;
	for (let index = 0; index < text.length; index++) {
		// tslint:disable-next-line no-bitwise
		hash = text.charCodeAt(index) + ((hash << 5) - hash);
	}

	// tslint:disable-next-line no-bitwise
	return (hash >> (text.length * 8)) & max;
};

export const randomString = (length = 16) => {
	let text = '';
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

export const regexEscape = (str: string) =>
	str.replace(matchOperatorsRe, '\\$&');
