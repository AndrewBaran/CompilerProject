module Compiler {
	
	export class Lexer {

		private static tokenPatterns;
		private static delimiterChars: RegExp;


		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string, symbolTable: SymbolTable): TokenInfo [] {

			this.setupTokenPatterns();

			Logger.log("Performing lexical analysis");

			var tokenList: TokenInfo [] = [];

			var stringMode: boolean = false;
			var eofFound: boolean = false;

			// Split source code into token-looking fragments
			var codeFragmentList: CodeFragment [] = this.splitCodeOnSpaces(inputCode);
			codeFragmentList = this.splitCodeOnDelimiters(codeFragmentList);

			var currentFragment: CodeFragment = null;
			var currentCode: string = "";

			var listIndex: number = 0;

			// Tokenize the individual elements of the split up code now
			while(listIndex !== codeFragmentList.length && !eofFound) {

				currentFragment = codeFragmentList[listIndex];
				currentCode = currentFragment.code;

				var tokenMatched: TokenMatch = this.matchesTokenPattern(currentCode);

				if(tokenMatched.isMatch) {

					var token: Token = tokenMatched.token;

					switch(token.getType()) {

						case TokenType.T_QUOTE:

							stringMode = stringMode ? false : true;
							break;

						case TokenType.T_EOF:

							eofFound = true;
							break;

						case TokenType.T_ID:

							// T_ID and T_CHAR share same regex, so swap on the spot
							if(stringMode) {
								token.setType(TokenType.T_CHAR);
							}

							break;

						case TokenType.T_DIGIT:

							if(stringMode) {

								var errorMessage: string = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid string character";

								Logger.log(errorMessage);
								throw errorMessage;
							}

							break;

						case TokenType.T_WHITE_SPACE:

							if(stringMode) {

								if(currentCode === "\n") {

									var errorMessage: string = "Error on line " + currentFragment.lineFoundOn + ": Newline is not a valid string character";

									Logger.log(errorMessage);
									throw errorMessage;
								}
							}

							break;

						case TokenType.T_SINGLE_EQUALS:

							// Next element is available
							if(!(listIndex + 1 === codeFragmentList.length)) {

								var nextCodeFragment: CodeFragment = codeFragmentList[listIndex + 1];
								var nextWord: string = nextCodeFragment.code;
								currentCode += nextWord;

								tokenMatched = this.matchesTokenPattern(currentCode);

								// Submit double equals
								if(tokenMatched.isMatch) {

									token = tokenMatched.token;
									listIndex++;
								}
							}

							else {
								// Submit single equals otherwise
							}

							break;

						case TokenType.T_EXCLAMATION_POINT:

							// No more code follows
							if((listIndex + 1) === codeFragmentList.length) {

								var errorMessage: string = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid lexeme.";

								Logger.log(errorMessage);
								throw errorMessage;
							}

							var nextCodeFragment: CodeFragment = codeFragmentList[listIndex + 1];
							var nextWord: string = nextCodeFragment.code;
							currentCode += nextWord;

							tokenMatched = this.matchesTokenPattern(currentCode);

							if(tokenMatched.isMatch && tokenMatched.token.getType() === TokenType.T_NOT_EQUALS) {

								token = tokenMatched.token;
								listIndex++;
							}

							else {

								var errorMessage: string = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid lexeme.";

								Logger.log(errorMessage);
								throw errorMessage;
							}

							break;

					} // switch

					var tokenInfo: TokenInfo = new TokenInfo();
					tokenInfo.token = token;
					tokenInfo.lineFoundOn = currentFragment.lineFoundOn;

					tokenList.push(tokenInfo);
				}

				else {

					var errorMessage: string = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid lexeme.";

					Logger.log(errorMessage);
					throw errorMessage;
				}

				listIndex++;
			}


			var logWarningCount: number = 0;

			if(eofFound) {

				// EOF should be last element in code list
				if(listIndex !== codeFragmentList.length) {

					Logger.log("Warning! Input found after EOF character");
					logWarningCount++;
				}
			}

			else {

				Logger.log("Warning! EOF character was not found. Adding it to the list");
				logWarningCount++;

				var eofToken: Token = new Token();
				eofToken.setType(TokenType.T_EOF);

				var lastLine: number = tokenList[tokenList.length - 1].lineFoundOn;

				var tokenInfo: TokenInfo = new TokenInfo();
				tokenInfo.token = eofToken;
				tokenInfo.lineFoundOn = lastLine;

				tokenList.push(tokenInfo);
			}

			Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s)");
			Logger.log("");

			return tokenList;

		} // tokenizeCode()

		// Looks for a regex match for the word, and if it does, produces a token of the type to be returned
		private static matchesTokenPattern(currentCode: string): TokenMatch {

			var returnTokenMatch: TokenMatch = new TokenMatch();
			var patternMatched: boolean = false;

			for(var i: number = 0; i < this.tokenPatterns.length && !patternMatched; i++) {

				var tokenRegex: RegExp = this.tokenPatterns[i].regex;
				var tokenType: TokenType = this.tokenPatterns[i].type;

				if(tokenRegex.test(currentCode)) {

					patternMatched = true;

					var currentToken: Token = new Token();
					currentToken.setType(tokenType);
					currentToken.setValue(currentCode);

					returnTokenMatch.token = currentToken;

					break;
				}
			}

			returnTokenMatch.isMatch = patternMatched;
			return returnTokenMatch;

		} // matchesTokenPattern()

		// Associate each regex with corresponding token
		private static setupTokenPatterns(): void {

			this.tokenPatterns = [
				{regex: /^while$/, type: TokenType.T_WHILE},
				{regex: /^if$/, type: TokenType.T_IF},
				{regex: /^true$/, type: TokenType.T_TRUE},
				{regex: /^false$/, type: TokenType.T_FALSE},
				{regex: /^int$/, type: TokenType.T_INT},
				{regex: /^string$/, type: TokenType.T_STRING},
				{regex: /^boolean$/, type: TokenType.T_BOOLEAN},
				{regex: /^print$/, type: TokenType.T_PRINT},
				{regex: /^\($/, type: TokenType.T_LPAREN},
				{regex: /^\)$/, type: TokenType.T_RPAREN},
				{regex: /^\{$/, type: TokenType.T_LBRACE},
				{regex: /^\}$/, type: TokenType.T_RBRACE},
				{regex: /^"$/, type: TokenType.T_QUOTE},
				{regex: /^[a-z]$/, type: TokenType.T_ID},
				{regex: /^[0-9]$/, type: TokenType.T_DIGIT},
				{regex: /^\+$/, type: TokenType.T_PLUS},
				{regex: /^\$$/, type: TokenType.T_EOF},
				{regex: /^=$/, type: TokenType.T_SINGLE_EQUALS},
				{regex: /^==$/, type: TokenType.T_DOUBLE_EQUALS},
				{regex: /^!=$/, type: TokenType.T_NOT_EQUALS},
				{regex: /^!$/, type: TokenType.T_EXCLAMATION_POINT},
				{regex: /^[\s|\n]$/, type: TokenType.T_WHITE_SPACE}
			];

			this.delimiterChars = /^[\{\}\(\_\)\$\"!=+]$/;

		} // setupTokenPatterns()

		// Preserves spaces within strings
		private static splitCodeOnSpaces(inputCode: string): CodeFragment [] {

			var codeFragmentList: CodeFragment [] = [];

			var logCurrentLine: number = 1;

			var stringMode: boolean = false;
			var whitespaceRegex: RegExp = /[\s\n]+/;

			var currentWord: string = "";
			var charIndex: number = 0;

			while(charIndex !== inputCode.length) {

				var currentChar: string = inputCode.charAt(charIndex);
				charIndex++;

				if(!whitespaceRegex.test(currentChar)) {
					currentWord += currentChar;
				}

				else {

					if(stringMode) {
						currentWord += currentChar;
					}

					else if(currentWord.length > 0) {

						var fragment: CodeFragment = new CodeFragment();
						fragment.code = currentWord;
						fragment.lineFoundOn = logCurrentLine;

						codeFragmentList.push(fragment);

						currentWord = "";
					}
				}

				if(currentChar === "\"") {
					stringMode = stringMode ? false : true;
				}

				// Last char
				if(charIndex === inputCode.length) {

					if(currentWord.length > 0) {

						var fragment: CodeFragment = new CodeFragment();
						fragment.code = currentWord;
						fragment.lineFoundOn = logCurrentLine;

						codeFragmentList.push(fragment);

						currentWord = "";

					}
				}

				if(currentChar === "\n") {
					logCurrentLine++;
				}

			}

			return codeFragmentList;

		} // splitCodeOnSpaces()

		private static splitCodeOnDelimiters(codeFragmentList: CodeFragment []): CodeFragment [] {

			var stringMode: boolean = false;
			var delimiterFound: boolean = false;

			var currentFragment: CodeFragment = null;
			var currentCode: string = "";

			var wordIndex: number = 0

			while(wordIndex !== codeFragmentList.length) {

				currentFragment = codeFragmentList[wordIndex];
				currentCode = currentFragment.code;

				for(var charIndex: number = 0; charIndex !== currentCode.length; charIndex++) {

					var currentChar: string = currentCode.charAt(charIndex);

					if(currentCode.length === 1) {

						if(currentChar === "\"") {
							stringMode = stringMode ? false : true;
						}

						continue;
					}

					if(this.delimiterChars.test(currentChar)) {

						var beforeIndex: number = 0;
						var afterIndex: number = 0;

						// Special case: extract first char of the string
						if(charIndex === 0) {
							beforeIndex = afterIndex = charIndex + 1;
						}

						else {
							beforeIndex = afterIndex = charIndex;
						}

						var subStringBefore: string = currentCode.substring(0, beforeIndex);
						var subStringAfter: string = currentCode.substring(afterIndex, currentCode.length);

						if(subStringBefore.length !== 0) {

							currentFragment.code = subStringBefore;
							codeFragmentList[wordIndex] = currentFragment;
						}

						// Insert substring after current index
						if(subStringAfter.length !== 0) {

							var fragment: CodeFragment = new CodeFragment();
							fragment.code = subStringAfter;
							fragment.lineFoundOn = currentFragment.lineFoundOn;

							codeFragmentList.splice(wordIndex + 1, 0, fragment);
						}

						delimiterFound = true;
						break;

					}

					else if(stringMode) {

						var subStringBefore: string = currentChar;
						var subStringAfter: string = currentCode.substring(1, currentCode.length);

						if(subStringBefore.length !== 0) {

							currentFragment.code = subStringBefore;
							codeFragmentList[wordIndex] = currentFragment;
						}

						// Insert substring after current index
						if(subStringAfter.length !== 0) {

							var fragment: CodeFragment = new CodeFragment();
							fragment.code = subStringAfter;
							fragment.lineFoundOn = currentFragment.lineFoundOn;

							codeFragmentList.splice(wordIndex + 1, 0, fragment);
						}

						delimiterFound = true;
						break;
					}
				}

				if(!delimiterFound) {
					wordIndex++;
				}

				delimiterFound = false;
			}

			return codeFragmentList;

		} // splitCodeOnDelimiters()

	} // Lexer


	// Structs
	class CodeFragment {

		public code: string;
		public lineFoundOn: number;

		constructor() {

			this.code = "";
			this.lineFoundOn = -1;
		}
	}


	class TokenMatch {

		public token: Token;
		public isMatch: boolean;

		constructor() {

			this.token = new Token();
			this.token.setType(TokenType.T_NO_MATCH);
			this.isMatch = false;
		}
	}

}