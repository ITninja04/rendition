import * as React from 'react';
import styled, { css } from 'styled-components';
import { style } from 'styled-system';
import asRendition from '../../asRendition';
import { RenditionSystemProps, Theme } from '../../common-types';
import { px, monospace } from '../../utils';
import { Copy } from '../Copy';

export const code = (props: ThemedTxtProps) =>
	props.code
		? css`
				font-family: ${(props) => props.theme.monospace};
				padding: 2px 4px;
				font-size: 90%;
				color: #c7254e;
				background-color: #f9f2f4;
				border-radius: 2px;
				white-space: normal;
				word-wrap: break-word;
				font-size: 1em;
				margin-right: ${(props) => px(props.theme.space[1])};
		  `
		: null;

export const whitespace = (props: ThemedTxtProps) =>
	props.whitespace
		? css`
				white-space: ${props.whitespace};
		  `
		: null;

export const caps = (props: ThemedTxtProps) =>
	props.caps
		? css`
				text-transform: uppercase;
				letter-spacing: 0.2em;
		  `
		: null;

export const italic = (props: ThemedTxtProps) =>
	props.italic
		? css`
				font-style: italic;
		  `
		: null;

export const bold = (props: ThemedTxtProps) =>
	props.bold
		? css`
				font-weight: ${props.theme.weights[props.theme.weights.length - 1]};
		  `
		: null;

export const truncate = (props: ThemedTxtProps) =>
	props.truncate &&
	css`
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	`;

export const align = style({
	key: 'text-align',
	prop: 'align',
	cssProperty: 'text-align',
});

export const Lopy = (props: ThemedTxtProps) =>
	props.truncate &&
	css`
		cursor: pointer;
	`;

export const LopyWrapper = styled.span`
	display: inline-block;
`;

const BaseTxt = styled.div<TxtProps>`
	${align}
	${monospace}
	${whitespace}
	${code}
	${caps}
	${bold}
	${italic}
	${truncate}
`;

const Factory = (tag?: string) => {
	return asRendition<React.FunctionComponent<TxtProps>>((props: any) => {
		console.log('*** props.copy', props.copy);
		return props.copy ? (
			<Copy content={props.children} show={props.copy}>
				<BaseTxt as={tag} {...props} />
			</Copy>
		) : (
			<BaseTxt as={tag} {...props} />
		);
	});
};

const Base = Factory() as React.FunctionComponent<TxtProps> & {
	p: React.FunctionComponent<TxtProps>;
	span: React.FunctionComponent<TxtProps>;
};

export type Whitespace =
	| 'normal'
	| 'nowrap'
	| 'pre'
	| 'pre-line'
	| 'pre-wrap'
	| 'initial'
	| 'inherit';
export type Align =
	| 'left'
	| 'right'
	| 'center'
	| 'justify'
	| 'justify-all'
	| 'start'
	| 'end'
	| 'match-parent'
	| 'inherit'
	| 'initial'
	| 'unset';

export interface InternalTxtProps extends React.HTMLAttributes<HTMLElement> {
	monospace?: boolean;
	/** If true, render text in a bold font */
	bold?: boolean;
	/** If true, render text in an italic font style */
	italic?: boolean;
	/** If true, render text in uppercase */
	caps?: boolean;
	/** Equivalent to the CSS white-space property, one of 'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'initial', 'inherit' */
	whitespace?: Whitespace;
	/** Align text inside the component, one of 'left', 'right', 'center', 'justify', 'justify-all', 'start', 'end', 'match-parent', 'inherit', 'initial', 'unset' */
	align?: Align;
	/** If true, replace the text not contained in the container with three dots */
	truncate?: boolean;
	code?: boolean;
	copy?: 'hover' | 'always';
}

export interface ThemedTxtProps extends InternalTxtProps {
	theme: Theme;
}

export type TxtProps = InternalTxtProps & RenditionSystemProps;

Base.displayName = 'Txt';
Base.span = Factory('span');
Base.p = Factory('p');

// defining the stuff for copy, maybe this can be it's own thing in another

/**
 * Displays a text block. A `<span>` tag can be used with `<Txt.span>` and a `<p>` tag can be used with `<Txt.p>`.
 *
 * [View story source](https://github.com/balena-io-modules/rendition/blob/master/src/components/Txt/Txt.stories.tsx)
 */
export const Txt = Base;
