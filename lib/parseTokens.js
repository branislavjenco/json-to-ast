import { parseValue } from "./parse";
import { tokenize, tokenTypes } from "./tokenize";
import location from "./location";
import error from "./error";
import parseErrorTypes from "./parseErrorTypes";

export const parseTokens = (input, tokenList, settings) => {
	const defaultSettings = {
		loc: true,
		source: null
	};
	settings = Object.assign({}, defaultSettings, settings);

	if (tokenList.length === 0) {
		errorEof(input, tokenList, settings);
	}

	const value = parseValue(input, tokenList, 0, settings);

	if (value.index === tokenList.length) {
		return { ast: value.value, tokens: tokenList };
	}

	const token = tokenList[value.index];

	error(
		parseErrorTypes.unexpectedToken(
			input.substring(token.loc.start.offset, token.loc.end.offset),
			settings.source,
			token.loc.start.line,
			token.loc.start.column
		),
		input,
		settings.source,
		token.loc.start.line,
		token.loc.start.column
	);
};

function errorEof(input, tokenList, settings) {
	const loc =
		tokenList.length > 0
			? tokenList[tokenList.length - 1].loc.end
			: { line: 1, column: 1 };

	error(
		parseErrorTypes.unexpectedEnd(),
		input,
		settings.source,
		loc.line,
		loc.column
	);
}
