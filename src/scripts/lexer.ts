module Compiler {
	
	export class Lexer {

		// TODO: Give this a type eventually
		private static tokenPatterns;
		private static delimiterChars: RegExp;

		// TODO: Remove log messages when finished
		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string, symbolTable: SymbolTable): Token [] {

			this.setupTokenPatterns();

			Logger.log("Performing lexical analysis");

			var logCurrentLetter: number = 1;
			var logCurrentLine: number = 1;
			var logWarningCount: number = 0;

			var tokenList: Token [] = [];

			var stringMode: boolean = false;
			var eofFound: boolean = false;
			var delimiterFound: boolean = false;

			var currentWord: string = "";
			var wordIndex: number = 0;

			var splitCodeList: string [] = this.splitCodeOnSpaces(inputCode);

			// Further split the code on delimiters
			while(wordIndex !== splitCodeList.length) {

				currentWord = splitCodeList[wordIndex];

				for(var charIndex: number = 0; charIndex !== currentWord.length && currentWord.length !== 1; charIndex++) {

					var currentChar: string = currentWord.charAt(charIndex);

					if(this.delimiterChars.test(currentChar)) {

						if(currentChar === "\"") {

							stringMode = stringMode ? false : true;
						}

						var beforeIndex: number = 0;
						var afterIndex: number = 0;

						// Special case: extract first char of the string
						if(charIndex === 0) {

							beforeIndex = afterIndex = charIndex + 1;
						}

						else {

							beforeIndex = charIndex;
							afterIndex = charIndex;
						}

						var subStringBefore: string = currentWord.substring(0, beforeIndex);
						var subStringAfter: string = currentWord.substring(afterIndex, currentWord.length);

						if(subStringBefore.length !== 0) {

							splitCodeList[wordIndex] = subStringBefore;
						}

						// Insert substring after current index
						if(subStringAfter.length !== 0) {

							splitCodeList.splice(wordIndex + 1, 0, subStringAfter);
						}

						delimiterFound = true;
						break;

					}

					else if(stringMode) {

						var subStringBefore: string = currentChar;
						var subStringAfter: string = currentWord.substring(1, currentWord.length);

						if(subStringBefore.length !== 0) {

							splitCodeList[wordIndex] = subStringBefore;
						}

						// Insert substring after current index
						if(subStringAfter.length !== 0) {

							splitCodeList.splice(wordIndex + 1, 0, subStringAfter);
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

			// TODO: Remove eventually
			Logger.log("Code fragments: ");
			for(var i: number = 0; i < splitCodeList.length; i++) {

				Logger.log("[" + i + "] = " + splitCodeList[i]);

				if(splitCodeList[i] === "\n" || splitCodeList[i] === " ") {
					Logger.log("Whitespace");
				}
			}

			stringMode = false;

			// TODO: Check for invalid string chars
			// Tokenize the individual elements of the split up code now
			var listIndex: number = 0;

			while(listIndex !== splitCodeList.length && !eofFound) {

				currentWord = splitCodeList[listIndex];

				var tokenMatched: TokenMatch = this.matchesTokenPattern(currentWord);

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

						// TODO: Do case where there is no next element
						case TokenType.T_SINGLE_EQUALS:

							// Check if next index is a single equals
							var nextCodeSegment: string = splitCodeList[listIndex + 1];
							currentWord += nextCodeSegment;

							tokenMatched = this.matchesTokenPattern(currentWord);

							// Submit double equals
							if(tokenMatched.isMatch) {

								token = tokenMatched.token;
								listIndex++;
							}

							// Submit single equals
							else {

								// TODO: This is only for debugging
								currentWord = splitCodeList[listIndex];
							}

							break;

						case TokenType.T_EXCLAMATION_POINT:

							// Check if next index is a single equals
							var nextCodeSegment: string = splitCodeList[listIndex + 1];
							currentWord += nextCodeSegment;

							tokenMatched = this.matchesTokenPattern(currentWord);

							if(tokenMatched.isMatch && tokenMatched.token.getType() === TokenType.T_NOT_EQUALS) {

								token = tokenMatched.token;
								listIndex++;
							}

							else {

								var errorMessage: string = "Error! " + currentWord + " is not a valid lexeme.";

								Logger.log(errorMessage);
								throw errorMessage;
							}

							break;
					}

					// TODO: Remove after debugging
					Logger.log(currentWord + " matched a regex");
					Logger.log("Type was " + token.getTokenName());

					tokenList.push(token);
				}

				else {

					var errorMessage: string = "Error! " + currentWord + " is not a valid lexeme.";

					Logger.log(errorMessage);
					throw errorMessage;
				}

				listIndex++;
			}


			if(eofFound) {

				// EOF should be last index in code list
				if(listIndex !== splitCodeList.length) {

					Logger.log("Warning! Input found after EOF character");
					logWarningCount++;
				}
			}

			else {

				Logger.log("Warning! EOF character was not found. Adding it to the list");
				logWarningCount++;

				var eofToken: Token = new Token();
				eofToken.setType(TokenType.T_EOF);
				eofToken.setValue("$");

				tokenList.push(eofToken);
			}

			Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s)");

			return tokenList;
		}

		// Looks for a regex match for the word, and if it does, produces a token of the type to be returned
		private static matchesTokenPattern(currentWord: string): TokenMatch {

			var returnTokenMatch: TokenMatch = new TokenMatch();
			var patternMatched: boolean = false;

			for(var i: number = 0; i < this.tokenPatterns.length && !patternMatched; i++) {

				var tokenRegex: RegExp = this.tokenPatterns[i].regex;
				var tokenType: TokenType = this.tokenPatterns[i].type;

				if(tokenRegex.test(currentWord)) {

					patternMatched = true;

					var currentToken: Token = new Token();
					currentToken.setType(tokenType);
					currentToken.setValue(currentWord);

					returnTokenMatch.token = currentToken;

					break;
				}
			}

			returnTokenMatch.isMatch = patternMatched;
			return returnTokenMatch;
		}

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
		}

		// Preserves spaces within strings
		private static splitCodeOnSpaces(inputCode: string): string [] {

			var currentWord: string = "";
			var charIndex: number = 0;

			var splitCodeList: string [] = [];

			var stringMode: boolean = false;
			var whitespaceRegex: RegExp = /[\s\n]+/;

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

						splitCodeList.push(currentWord);
						currentWord = "";
					}
				}

				if(currentChar === "\"") {
					stringMode = stringMode ? false : true;
				}

				// Last char
				if(charIndex === inputCode.length) {

					if(currentWord.length > 0) {

						splitCodeList.push(currentWord);
						currentWord = "";
					}
				}

			}

			return splitCodeList;
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