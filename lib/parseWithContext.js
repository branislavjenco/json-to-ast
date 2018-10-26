import { parseValue } from "./parse";
import { tokenize, tokenTypes } from "./tokenize";
import location from "./location";
import error from "./error";
import parseErrorTypes from "./parseErrorTypes";

export const parseWithContext = (input, offset, settings) => {
	const defaultSettings = {
		loc: true,
		source: null
	};
	settings = Object.assign({}, defaultSettings, settings);

	let tokenList = tokenize(input, settings);

	if (tokenList.length === 0) {
		errorEof(input, tokenList, settings);
	}

	tokenList = removePreceedingCommaIfExists(tokenList, offset);

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

function removePreceedingCommaIfExists(tokens, offset) {
	console.lot(tokens);
	let previousTokenIndex;
	for (let i = 0; i < tokens.length; i++) {
		if (
			tokens[i - 1] &&
			offset >= tokens[i - 1].loc.end.offset &&
			offset <= tokens[i].loc.end.offset
		) {
			previousTokenIndex = i - 1;
		}
	}
	if (tokens[previousTokenIndex].type === tokenTypes.COMMA) {
		tokens.splice(previousTokenIndex, 1);
	}
	console.log(tokens);
	return tokens;
}
