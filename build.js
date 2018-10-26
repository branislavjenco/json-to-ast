(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.jsonToAst = {})));
}(this, (function (exports) { 'use strict';

	var location = ((startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) => ({
	  start: {
	    line: startLine,
	    column: startColumn,
	    offset: startOffset
	  },
	  end: {
	    line: endLine,
	    column: endColumn,
	    offset: endOffset
	  },
	  source: source || null
	}));

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var build = createCommonjsModule(function (module, exports) {
	  (function (global, factory) {
	    module.exports = factory();
	  })(commonjsGlobal, function () {
	    /**
	     * Results cache
	     */

	    var res = '';
	    var cache;
	    /**
	     * Expose `repeat`
	     */

	    var repeatString = repeat;
	    /**
	     * Repeat the given `string` the specified `number`
	     * of times.
	     *
	     * **Example:**
	     *
	     * ```js
	     * var repeat = require('repeat-string');
	     * repeat('A', 5);
	     * //=> AAAAA
	     * ```
	     *
	     * @param {String} `string` The string to repeat
	     * @param {Number} `number` The number of times to repeat the string
	     * @return {String} Repeated string
	     * @api public
	     */

	    function repeat(str, num) {
	      if (typeof str !== 'string') {
	        throw new TypeError('expected a string');
	      } // cover common, quick use cases


	      if (num === 1) return str;
	      if (num === 2) return str + str;
	      var max = str.length * num;

	      if (cache !== str || typeof cache === 'undefined') {
	        cache = str;
	        res = '';
	      } else if (res.length >= max) {
	        return res.substr(0, max);
	      }

	      while (max > res.length && num > 1) {
	        if (num & 1) {
	          res += str;
	        }

	        num >>= 1;
	        str += str;
	      }

	      res += str;
	      res = res.substr(0, max);
	      return res;
	    }

	    var padStart = function (string, maxLength, fillString) {
	      if (string == null || maxLength == null) {
	        return string;
	      }

	      var result = String(string);
	      var targetLen = typeof maxLength === 'number' ? maxLength : parseInt(maxLength, 10);

	      if (isNaN(targetLen) || !isFinite(targetLen)) {
	        return result;
	      }

	      var length = result.length;

	      if (length >= targetLen) {
	        return result;
	      }

	      var fill = fillString == null ? '' : String(fillString);

	      if (fill === '') {
	        fill = ' ';
	      }

	      var fillLen = targetLen - length;

	      while (fill.length < fillLen) {
	        fill += fill;
	      }

	      var truncated = fill.length > fillLen ? fill.substr(0, fillLen) : fill;
	      return truncated + result;
	    };

	    var _extends = Object.assign || function (target) {
	      for (var i = 1; i < arguments.length; i++) {
	        var source = arguments[i];

	        for (var key in source) {
	          if (Object.prototype.hasOwnProperty.call(source, key)) {
	            target[key] = source[key];
	          }
	        }
	      }

	      return target;
	    };

	    function printLine(line, position, maxNumLength, settings) {
	      var num = String(position);
	      var formattedNum = padStart(num, maxNumLength, ' ');
	      var tabReplacement = repeatString(' ', settings.tabSize);
	      return formattedNum + ' | ' + line.replace(/\t/g, tabReplacement);
	    }

	    function printLines(lines, start, end, maxNumLength, settings) {
	      return lines.slice(start, end).map(function (line, i) {
	        return printLine(line, start + i + 1, maxNumLength, settings);
	      }).join('\n');
	    }

	    var defaultSettings = {
	      extraLines: 2,
	      tabSize: 4
	    };

	    var index = function (input, linePos, columnPos, settings) {
	      settings = _extends({}, defaultSettings, settings);
	      var lines = input.split(/\r\n?|\n|\f/);
	      var startLinePos = Math.max(1, linePos - settings.extraLines) - 1;
	      var endLinePos = Math.min(linePos + settings.extraLines, lines.length);
	      var maxNumLength = String(endLinePos).length;
	      var prevLines = printLines(lines, startLinePos, linePos, maxNumLength, settings);
	      var targetLineBeforeCursor = printLine(lines[linePos - 1].substring(0, columnPos - 1), linePos, maxNumLength, settings);
	      var cursorLine = repeatString(' ', targetLineBeforeCursor.length) + '^';
	      var nextLines = printLines(lines, linePos, endLinePos, maxNumLength, settings);
	      return [prevLines, cursorLine, nextLines].filter(Boolean).join('\n');
	    };

	    return index;
	  });
	});

	const errorStack = new Error().stack;
	var createError = (props => {
	  // use Object.create(), because some VMs prevent setting line/column otherwise
	  // (iOS Safari 10 even throws an exception)
	  const error = Object.create(SyntaxError.prototype);
	  Object.assign(error, props, {
	    name: 'SyntaxError'
	  });
	  Object.defineProperty(error, 'stack', {
	    get() {
	      return errorStack ? errorStack.replace(/^(.+\n){1,3}/, String(error) + '\n') : '';
	    }

	  });
	  return error;
	});

	var error = ((message, input, source, line, column) => {
	  throw createError({
	    message: line ? message + '\n' + build(input, line, column) : message,
	    rawMessage: message,
	    source,
	    line,
	    column
	  });
	});

	var parseErrorTypes = {
	  unexpectedEnd: () => 'Unexpected end of input',
	  unexpectedToken: (token, ...position) => `Unexpected token <${token}> at ${position.filter(Boolean).join(':')}`
	};

	var tokenizeErrorTypes = {
	  unexpectedSymbol: (symbol, ...position) => `Unexpected symbol <${symbol}> at ${position.filter(Boolean).join(':')}`
	};

	const tokenTypes = {
	  LEFT_BRACE: 0,
	  // {
	  RIGHT_BRACE: 1,
	  // }
	  LEFT_BRACKET: 2,
	  // [
	  RIGHT_BRACKET: 3,
	  // ]
	  COLON: 4,
	  // :
	  COMMA: 5,
	  // ,
	  STRING: 6,
	  //
	  NUMBER: 7,
	  //
	  TRUE: 8,
	  // true
	  FALSE: 9,
	  // false
	  NULL: 10 // null

	};
	const punctuatorTokensMap = {
	  // Lexeme: Token
	  '{': tokenTypes.LEFT_BRACE,
	  '}': tokenTypes.RIGHT_BRACE,
	  '[': tokenTypes.LEFT_BRACKET,
	  ']': tokenTypes.RIGHT_BRACKET,
	  ':': tokenTypes.COLON,
	  ',': tokenTypes.COMMA
	};
	const keywordTokensMap = {
	  // Lexeme: Token
	  'true': tokenTypes.TRUE,
	  'false': tokenTypes.FALSE,
	  'null': tokenTypes.NULL
	};
	const stringStates = {
	  _START_: 0,
	  START_QUOTE_OR_CHAR: 1,
	  ESCAPE: 2
	};
	const escapes = {
	  '"': 0,
	  // Quotation mask
	  '\\': 1,
	  // Reverse solidus
	  '/': 2,
	  // Solidus
	  'b': 3,
	  // Backspace
	  'f': 4,
	  // Form feed
	  'n': 5,
	  // New line
	  'r': 6,
	  // Carriage return
	  't': 7,
	  // Horizontal tab
	  'u': 8 // 4 hexadecimal digits

	};
	const numberStates = {
	  _START_: 0,
	  MINUS: 1,
	  ZERO: 2,
	  DIGIT: 3,
	  POINT: 4,
	  DIGIT_FRACTION: 5,
	  EXP: 6,
	  EXP_DIGIT_OR_SIGN: 7
	}; // HELPERS

	function isDigit1to9(char) {
	  return char >= '1' && char <= '9';
	}

	function isDigit(char) {
	  return char >= '0' && char <= '9';
	}

	function isHex(char) {
	  return isDigit(char) || char >= 'a' && char <= 'f' || char >= 'A' && char <= 'F';
	}

	function isExp(char) {
	  return char === 'e' || char === 'E';
	} // PARSERS


	function parseWhitespace(input, index, line, column) {
	  const char = input.charAt(index);

	  if (char === '\r') {
	    // CR (Unix)
	    index++;
	    line++;
	    column = 1;

	    if (input.charAt(index) === '\n') {
	      // CRLF (Windows)
	      index++;
	    }
	  } else if (char === '\n') {
	    // LF (MacOS)
	    index++;
	    line++;
	    column = 1;
	  } else if (char === '\t' || char === ' ') {
	    index++;
	    column++;
	  } else {
	    return null;
	  }

	  return {
	    index,
	    line,
	    column
	  };
	}

	function parseChar(input, index, line, column) {
	  const char = input.charAt(index);

	  if (char in punctuatorTokensMap) {
	    return {
	      type: punctuatorTokensMap[char],
	      line,
	      column: column + 1,
	      index: index + 1,
	      value: null
	    };
	  }

	  return null;
	}

	function parseKeyword(input, index, line, column) {
	  for (const name in keywordTokensMap) {
	    if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
	      return {
	        type: keywordTokensMap[name],
	        line,
	        column: column + name.length,
	        index: index + name.length,
	        value: name
	      };
	    }
	  }

	  return null;
	}

	function parseString(input, index, line, column) {
	  const startIndex = index;
	  let state = stringStates._START_;

	  while (index < input.length) {
	    const char = input.charAt(index);

	    switch (state) {
	      case stringStates._START_:
	        {
	          if (char === '"') {
	            index++;
	            state = stringStates.START_QUOTE_OR_CHAR;
	          } else {
	            return null;
	          }

	          break;
	        }

	      case stringStates.START_QUOTE_OR_CHAR:
	        {
	          if (char === '\\') {
	            index++;
	            state = stringStates.ESCAPE;
	          } else if (char === '"') {
	            index++;
	            return {
	              type: tokenTypes.STRING,
	              line,
	              column: column + index - startIndex,
	              index,
	              value: input.slice(startIndex, index)
	            };
	          } else {
	            index++;
	          }

	          break;
	        }

	      case stringStates.ESCAPE:
	        {
	          if (char in escapes) {
	            index++;

	            if (char === 'u') {
	              for (let i = 0; i < 4; i++) {
	                const curChar = input.charAt(index);

	                if (curChar && isHex(curChar)) {
	                  index++;
	                } else {
	                  return null;
	                }
	              }
	            }

	            state = stringStates.START_QUOTE_OR_CHAR;
	          } else {
	            return null;
	          }

	          break;
	        }
	    }
	  }
	}

	function parseNumber(input, index, line, column) {
	  const startIndex = index;
	  let passedValueIndex = index;
	  let state = numberStates._START_;

	  iterator: while (index < input.length) {
	    const char = input.charAt(index);

	    switch (state) {
	      case numberStates._START_:
	        {
	          if (char === '-') {
	            state = numberStates.MINUS;
	          } else if (char === '0') {
	            passedValueIndex = index + 1;
	            state = numberStates.ZERO;
	          } else if (isDigit1to9(char)) {
	            passedValueIndex = index + 1;
	            state = numberStates.DIGIT;
	          } else {
	            return null;
	          }

	          break;
	        }

	      case numberStates.MINUS:
	        {
	          if (char === '0') {
	            passedValueIndex = index + 1;
	            state = numberStates.ZERO;
	          } else if (isDigit1to9(char)) {
	            passedValueIndex = index + 1;
	            state = numberStates.DIGIT;
	          } else {
	            return null;
	          }

	          break;
	        }

	      case numberStates.ZERO:
	        {
	          if (char === '.') {
	            state = numberStates.POINT;
	          } else if (isExp(char)) {
	            state = numberStates.EXP;
	          } else {
	            break iterator;
	          }

	          break;
	        }

	      case numberStates.DIGIT:
	        {
	          if (isDigit(char)) {
	            passedValueIndex = index + 1;
	          } else if (char === '.') {
	            state = numberStates.POINT;
	          } else if (isExp(char)) {
	            state = numberStates.EXP;
	          } else {
	            break iterator;
	          }

	          break;
	        }

	      case numberStates.POINT:
	        {
	          if (isDigit(char)) {
	            passedValueIndex = index + 1;
	            state = numberStates.DIGIT_FRACTION;
	          } else {
	            break iterator;
	          }

	          break;
	        }

	      case numberStates.DIGIT_FRACTION:
	        {
	          if (isDigit(char)) {
	            passedValueIndex = index + 1;
	          } else if (isExp(char)) {
	            state = numberStates.EXP;
	          } else {
	            break iterator;
	          }

	          break;
	        }

	      case numberStates.EXP:
	        {
	          if (char === '+' || char === '-') {
	            state = numberStates.EXP_DIGIT_OR_SIGN;
	          } else if (isDigit(char)) {
	            passedValueIndex = index + 1;
	            state = numberStates.EXP_DIGIT_OR_SIGN;
	          } else {
	            break iterator;
	          }

	          break;
	        }

	      case numberStates.EXP_DIGIT_OR_SIGN:
	        {
	          if (isDigit(char)) {
	            passedValueIndex = index + 1;
	          } else {
	            break iterator;
	          }

	          break;
	        }
	    }

	    index++;
	  }

	  if (passedValueIndex > 0) {
	    return {
	      type: tokenTypes.NUMBER,
	      line,
	      column: column + passedValueIndex - startIndex,
	      index: passedValueIndex,
	      value: input.slice(startIndex, passedValueIndex)
	    };
	  }

	  return null;
	}

	function tokenize(input, settings) {
	  let line = 1;
	  let column = 1;
	  let index = 0;
	  const tokens = [];

	  while (index < input.length) {
	    const args = [input, index, line, column];
	    const whitespace = parseWhitespace(...args);

	    if (whitespace) {
	      index = whitespace.index;
	      line = whitespace.line;
	      column = whitespace.column;
	      continue;
	    }

	    const matched = parseChar(...args) || parseKeyword(...args) || parseString(...args) || parseNumber(...args);

	    if (matched) {
	      const token = {
	        type: matched.type,
	        value: matched.value,
	        loc: location(line, column, index, matched.line, matched.column, matched.index, settings.source)
	      };
	      tokens.push(token);
	      index = matched.index;
	      line = matched.line;
	      column = matched.column;
	    } else {
	      error(tokenizeErrorTypes.unexpectedSymbol(input.charAt(index), settings.source, line, column), input, settings.source, line, column);
	    }
	  }

	  return tokens;
	}

	const objectStates = {
	  _START_: 0,
	  OPEN_OBJECT: 1,
	  PROPERTY: 2,
	  COMMA: 3
	};
	const propertyStates = {
	  _START_: 0,
	  KEY: 1,
	  COLON: 2
	};
	const arrayStates = {
	  _START_: 0,
	  OPEN_ARRAY: 1,
	  VALUE: 2,
	  COMMA: 3
	};
	const defaultSettings = {
	  loc: true,
	  source: null
	};

	function errorEof(input, tokenList, settings) {
	  const loc = tokenList.length > 0 ? tokenList[tokenList.length - 1].loc.end : {
	    line: 1,
	    column: 1
	  };
	  error(parseErrorTypes.unexpectedEnd(), input, settings.source, loc.line, loc.column);
	}
	/** @param hexCode {string} hexCode without '\u' prefix */


	function parseHexEscape(hexCode) {
	  let charCode = 0;

	  for (let i = 0; i < 4; i++) {
	    charCode = charCode * 16 + parseInt(hexCode[i], 16);
	  }

	  return String.fromCharCode(charCode);
	}

	const escapes$1 = {
	  'b': '\b',
	  // Backspace
	  'f': '\f',
	  // Form feed
	  'n': '\n',
	  // New line
	  'r': '\r',
	  // Carriage return
	  't': '\t' // Horizontal tab

	};
	const passEscapes = ['"', '\\', '/'];
	/** @param {string} string */

	function parseString$1(string) {
	  let result = '';

	  for (let i = 0; i < string.length; i++) {
	    const char = string.charAt(i);

	    if (char === '\\') {
	      i++;
	      const nextChar = string.charAt(i);

	      if (nextChar === 'u') {
	        result += parseHexEscape(string.substr(i + 1, 4));
	        i += 4;
	      } else if (passEscapes.indexOf(nextChar) !== -1) {
	        result += nextChar;
	      } else if (nextChar in escapes$1) {
	        result += escapes$1[nextChar];
	      } else {
	        break;
	      }
	    } else {
	      result += char;
	    }
	  }

	  return result;
	}

	function parseObject(input, tokenList, index, settings) {
	  // object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
	  let startToken;
	  const object = {
	    type: 'Object',
	    children: []
	  };
	  let state = objectStates._START_;

	  while (index < tokenList.length) {
	    const token = tokenList[index];

	    switch (state) {
	      case objectStates._START_:
	        {
	          if (token.type === tokenTypes.LEFT_BRACE) {
	            startToken = token;
	            state = objectStates.OPEN_OBJECT;
	            index++;
	          } else {
	            return null;
	          }

	          break;
	        }

	      case objectStates.OPEN_OBJECT:
	        {
	          if (token.type === tokenTypes.RIGHT_BRACE) {
	            if (settings.loc) {
	              object.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
	            }

	            return {
	              value: object,
	              index: index + 1
	            };
	          } else {
	            const property = parseProperty(input, tokenList, index, settings);
	            object.children.push(property.value);
	            state = objectStates.PROPERTY;
	            index = property.index;
	          }

	          break;
	        }

	      case objectStates.PROPERTY:
	        {
	          if (token.type === tokenTypes.RIGHT_BRACE) {
	            if (settings.loc) {
	              object.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
	            }

	            return {
	              value: object,
	              index: index + 1
	            };
	          } else if (token.type === tokenTypes.COMMA) {
	            state = objectStates.COMMA;
	            index++;
	          } else {
	            error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	          }

	          break;
	        }

	      case objectStates.COMMA:
	        {
	          const property = parseProperty(input, tokenList, index, settings);

	          if (property) {
	            index = property.index;
	            object.children.push(property.value);
	            state = objectStates.PROPERTY;
	          } else {
	            error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	          }

	          break;
	        }
	    }
	  }

	  errorEof(input, tokenList, settings);
	}

	function parseProperty(input, tokenList, index, settings) {
	  // property: STRING COLON value
	  let startToken;
	  const property = {
	    type: 'Property',
	    key: null,
	    value: null
	  };
	  let state = propertyStates._START_;

	  while (index < tokenList.length) {
	    const token = tokenList[index];

	    switch (state) {
	      case propertyStates._START_:
	        {
	          if (token.type === tokenTypes.STRING) {
	            const key = {
	              type: 'Identifier',
	              value: parseString$1(input.slice(token.loc.start.offset + 1, token.loc.end.offset - 1)),
	              raw: token.value
	            };

	            if (settings.loc) {
	              key.loc = token.loc;
	            }

	            startToken = token;
	            property.key = key;
	            state = propertyStates.KEY;
	            index++;
	          } else {
	            return null;
	          }

	          break;
	        }

	      case propertyStates.KEY:
	        {
	          if (token.type === tokenTypes.COLON) {
	            state = propertyStates.COLON;
	            index++;
	          } else {
	            error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	          }

	          break;
	        }

	      case propertyStates.COLON:
	        {
	          const value = parseValue(input, tokenList, index, settings);
	          property.value = value.value;

	          if (settings.loc) {
	            property.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, value.value.loc.end.line, value.value.loc.end.column, value.value.loc.end.offset, settings.source);
	          }

	          return {
	            value: property,
	            index: value.index
	          };
	        }
	    }
	  }
	}

	function parseArray(input, tokenList, index, settings) {
	  // array: LEFT_BRACKET (value (COMMA value)*)? RIGHT_BRACKET
	  let startToken;
	  const array = {
	    type: 'Array',
	    children: []
	  };
	  let state = arrayStates._START_;
	  let token;

	  while (index < tokenList.length) {
	    token = tokenList[index];

	    switch (state) {
	      case arrayStates._START_:
	        {
	          if (token.type === tokenTypes.LEFT_BRACKET) {
	            startToken = token;
	            state = arrayStates.OPEN_ARRAY;
	            index++;
	          } else {
	            return null;
	          }

	          break;
	        }

	      case arrayStates.OPEN_ARRAY:
	        {
	          if (token.type === tokenTypes.RIGHT_BRACKET) {
	            if (settings.loc) {
	              array.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
	            }

	            return {
	              value: array,
	              index: index + 1
	            };
	          } else {
	            const value = parseValue(input, tokenList, index, settings);
	            index = value.index;
	            array.children.push(value.value);
	            state = arrayStates.VALUE;
	          }

	          break;
	        }

	      case arrayStates.VALUE:
	        {
	          if (token.type === tokenTypes.RIGHT_BRACKET) {
	            if (settings.loc) {
	              array.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
	            }

	            return {
	              value: array,
	              index: index + 1
	            };
	          } else if (token.type === tokenTypes.COMMA) {
	            state = arrayStates.COMMA;
	            index++;
	          } else {
	            error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	          }

	          break;
	        }

	      case arrayStates.COMMA:
	        {
	          const value = parseValue(input, tokenList, index, settings);
	          index = value.index;
	          array.children.push(value.value);
	          state = arrayStates.VALUE;
	          break;
	        }
	    }
	  }

	  errorEof(input, tokenList, settings);
	}

	function parseLiteral(input, tokenList, index, settings) {
	  // literal: STRING | NUMBER | TRUE | FALSE | NULL
	  const token = tokenList[index];
	  let value = null;

	  switch (token.type) {
	    case tokenTypes.STRING:
	      {
	        value = parseString$1(input.slice(token.loc.start.offset + 1, token.loc.end.offset - 1));
	        break;
	      }

	    case tokenTypes.NUMBER:
	      {
	        value = Number(token.value);
	        break;
	      }

	    case tokenTypes.TRUE:
	      {
	        value = true;
	        break;
	      }

	    case tokenTypes.FALSE:
	      {
	        value = false;
	        break;
	      }

	    case tokenTypes.NULL:
	      {
	        value = null;
	        break;
	      }

	    default:
	      {
	        return null;
	      }
	  }

	  const literal = {
	    type: 'Literal',
	    value,
	    raw: token.value
	  };

	  if (settings.loc) {
	    literal.loc = token.loc;
	  }

	  return {
	    value: literal,
	    index: index + 1
	  };
	}

	function parseValue(input, tokenList, index, settings) {
	  // value: literal | object | array
	  const token = tokenList[index];
	  const value = parseLiteral(...arguments) || parseObject(...arguments) || parseArray(...arguments);

	  if (value) {
	    return value;
	  } else {
	    error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	  }
	}

	var parse = ((input, settings) => {
	  settings = Object.assign({}, defaultSettings, settings);
	  const tokenList = tokenize(input, settings);

	  if (tokenList.length === 0) {
	    errorEof(input, tokenList, settings);
	  }

	  const value = parseValue(input, tokenList, 0, settings);

	  if (value.index === tokenList.length) {
	    return {
	      ast: value.value,
	      tokens: tokenList
	    };
	  }

	  const token = tokenList[value.index];
	  error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	});

	exports.default = parse;
	exports.tokenTypes = tokenTypes;

	Object.defineProperty(exports, '__esModule', { value: true });

})));