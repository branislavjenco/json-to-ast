(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.jsonToAst = {})));
}(this, (function (exports) { 'use strict';

	var location = (function (startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
	  return {
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
	  };
	});

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

	var errorStack = new Error().stack;
	var createError = (function (props) {
	  // use Object.create(), because some VMs prevent setting line/column otherwise
	  // (iOS Safari 10 even throws an exception)
	  var error = Object.create(SyntaxError.prototype);
	  Object.assign(error, props, {
	    name: 'SyntaxError'
	  });
	  Object.defineProperty(error, 'stack', {
	    get: function get() {
	      return errorStack ? errorStack.replace(/^(.+\n){1,3}/, String(error) + '\n') : '';
	    }
	  });
	  return error;
	});

	var error = (function (message, input, source, line, column) {
	  throw createError({
	    message: line ? message + '\n' + build(input, line, column) : message,
	    rawMessage: message,
	    source: source,
	    line: line,
	    column: column
	  });
	});

	var parseErrorTypes = {
	  unexpectedEnd: function unexpectedEnd() {
	    return 'Unexpected end of input';
	  },
	  unexpectedToken: function unexpectedToken(token) {
	    for (var _len = arguments.length, position = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      position[_key - 1] = arguments[_key];
	    }

	    return "Unexpected token <".concat(token, "> at ").concat(position.filter(Boolean).join(':'));
	  }
	};

	var tokenizeErrorTypes = {
	  unexpectedSymbol: function unexpectedSymbol(symbol) {
	    for (var _len = arguments.length, position = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      position[_key - 1] = arguments[_key];
	    }

	    return "Unexpected symbol <".concat(symbol, "> at ").concat(position.filter(Boolean).join(':'));
	  }
	};

	var tokenTypes = {
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
	var punctuatorTokensMap = {
	  // Lexeme: Token
	  '{': tokenTypes.LEFT_BRACE,
	  '}': tokenTypes.RIGHT_BRACE,
	  '[': tokenTypes.LEFT_BRACKET,
	  ']': tokenTypes.RIGHT_BRACKET,
	  ':': tokenTypes.COLON,
	  ',': tokenTypes.COMMA
	};
	var keywordTokensMap = {
	  // Lexeme: Token
	  'true': tokenTypes.TRUE,
	  'false': tokenTypes.FALSE,
	  'null': tokenTypes.NULL
	};
	var stringStates = {
	  _START_: 0,
	  START_QUOTE_OR_CHAR: 1,
	  ESCAPE: 2
	};
	var escapes = {
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
	var numberStates = {
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
	  var char = input.charAt(index);

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
	    index: index,
	    line: line,
	    column: column
	  };
	}

	function parseChar(input, index, line, column) {
	  var char = input.charAt(index);

	  if (char in punctuatorTokensMap) {
	    return {
	      type: punctuatorTokensMap[char],
	      line: line,
	      column: column + 1,
	      index: index + 1,
	      value: null
	    };
	  }

	  return null;
	}

	function parseKeyword(input, index, line, column) {
	  for (var name in keywordTokensMap) {
	    if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
	      return {
	        type: keywordTokensMap[name],
	        line: line,
	        column: column + name.length,
	        index: index + name.length,
	        value: name
	      };
	    }
	  }

	  return null;
	}

	function parseString(input, index, line, column) {
	  var startIndex = index;
	  var state = stringStates._START_;

	  while (index < input.length) {
	    var char = input.charAt(index);

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
	              line: line,
	              column: column + index - startIndex,
	              index: index,
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
	              for (var i = 0; i < 4; i++) {
	                var curChar = input.charAt(index);

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
	  var startIndex = index;
	  var passedValueIndex = index;
	  var state = numberStates._START_;

	  iterator: while (index < input.length) {
	    var char = input.charAt(index);

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
	      line: line,
	      column: column + passedValueIndex - startIndex,
	      index: passedValueIndex,
	      value: input.slice(startIndex, passedValueIndex)
	    };
	  }

	  return null;
	}

	function tokenize(input, settings) {
	  var defaultSettings = {
	    loc: true,
	    source: null
	  };
	  settings = Object.assign({}, defaultSettings, settings);
	  var line = 1;
	  var column = 1;
	  var index = 0;
	  var tokens = [];

	  while (index < input.length) {
	    var args = [input, index, line, column];
	    var whitespace = parseWhitespace.apply(void 0, args);

	    if (whitespace) {
	      index = whitespace.index;
	      line = whitespace.line;
	      column = whitespace.column;
	      continue;
	    }

	    var matched = parseChar.apply(void 0, args) || parseKeyword.apply(void 0, args) || parseString.apply(void 0, args) || parseNumber.apply(void 0, args);

	    if (matched) {
	      var token = {
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

	var objectStates = {
	  _START_: 0,
	  OPEN_OBJECT: 1,
	  PROPERTY: 2,
	  COMMA: 3
	};
	var propertyStates = {
	  _START_: 0,
	  KEY: 1,
	  COLON: 2
	};
	var arrayStates = {
	  _START_: 0,
	  OPEN_ARRAY: 1,
	  VALUE: 2,
	  COMMA: 3
	};
	var defaultSettings = {
	  loc: true,
	  source: null
	};

	function errorEof(input, tokenList, settings) {
	  var loc = tokenList.length > 0 ? tokenList[tokenList.length - 1].loc.end : {
	    line: 1,
	    column: 1
	  };
	  error(parseErrorTypes.unexpectedEnd(), input, settings.source, loc.line, loc.column);
	}
	/** @param hexCode {string} hexCode without '\u' prefix */


	function parseHexEscape(hexCode) {
	  var charCode = 0;

	  for (var i = 0; i < 4; i++) {
	    charCode = charCode * 16 + parseInt(hexCode[i], 16);
	  }

	  return String.fromCharCode(charCode);
	}

	var escapes$1 = {
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
	var passEscapes = ['"', '\\', '/'];
	/** @param {string} string */

	function parseString$1(string) {
	  var result = '';

	  for (var i = 0; i < string.length; i++) {
	    var char = string.charAt(i);

	    if (char === '\\') {
	      i++;
	      var nextChar = string.charAt(i);

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
	  var startToken;
	  var object = {
	    type: 'Object',
	    children: []
	  };
	  var state = objectStates._START_;

	  while (index < tokenList.length) {
	    var token = tokenList[index];

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
	            var property = parseProperty(input, tokenList, index, settings);
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
	          var _property = parseProperty(input, tokenList, index, settings);

	          if (_property) {
	            index = _property.index;
	            object.children.push(_property.value);
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
	  var startToken;
	  var property = {
	    type: 'Property',
	    key: null,
	    value: null
	  };
	  var state = propertyStates._START_;

	  while (index < tokenList.length) {
	    var token = tokenList[index];

	    switch (state) {
	      case propertyStates._START_:
	        {
	          if (token.type === tokenTypes.STRING) {
	            var key = {
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
	          var value = parseValue(input, tokenList, index, settings);
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
	  var startToken;
	  var array = {
	    type: 'Array',
	    children: []
	  };
	  var state = arrayStates._START_;
	  var token;

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
	            var value = parseValue(input, tokenList, index, settings);
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
	          var _value = parseValue(input, tokenList, index, settings);

	          index = _value.index;
	          array.children.push(_value.value);
	          state = arrayStates.VALUE;
	          break;
	        }
	    }
	  }

	  errorEof(input, tokenList, settings);
	}

	function parseLiteral(input, tokenList, index, settings) {
	  // literal: STRING | NUMBER | TRUE | FALSE | NULL
	  var token = tokenList[index];
	  var value = null;

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

	  var literal = {
	    type: 'Literal',
	    value: value,
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
	  var token = tokenList[index];
	  var value = parseLiteral.apply(void 0, arguments) || parseObject.apply(void 0, arguments) || parseArray.apply(void 0, arguments);

	  if (value) {
	    return value;
	  } else {
	    error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	  }
	}
	var parse = (function (input, settings) {
	  settings = Object.assign({}, defaultSettings, settings);
	  var tokenList = tokenize(input, settings);

	  if (tokenList.length === 0) {
	    errorEof(input, tokenList, settings);
	  }

	  var value = parseValue(input, tokenList, 0, settings);

	  if (value.index === tokenList.length) {
	    return {
	      ast: value.value,
	      tokens: tokenList
	    };
	  }

	  var token = tokenList[value.index];
	  error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	});

	var parseTokens = function parseTokens(input, tokenList, settings) {
	  var defaultSettings = {
	    loc: true,
	    source: null
	  };
	  settings = Object.assign({}, defaultSettings, settings);

	  if (tokenList.length === 0) {
	    errorEof$1(input, tokenList, settings);
	  }

	  var value = parseValue(input, tokenList, 0, settings);

	  if (value.index === tokenList.length) {
	    return value.value;
	  }

	  var token = tokenList[value.index];
	  error(parseErrorTypes.unexpectedToken(input.substring(token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	};

	function errorEof$1(input, tokenList, settings) {
	  var loc = tokenList.length > 0 ? tokenList[tokenList.length - 1].loc.end : {
	    line: 1,
	    column: 1
	  };
	  error(parseErrorTypes.unexpectedEnd(), input, settings.source, loc.line, loc.column);
	}

	exports.default = parse;
	exports.tokenize = tokenize;
	exports.tokenTypes = tokenTypes;
	exports.parseTokens = parseTokens;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
