module Compiler {
	
	export class Lexer {

		// TODO: Give this a type eventually
		private static tokenPatterns;
		private static delimiterChars: RegExp;

		/*
			TODO: Game plan

			Split inputCode on spaces and newline
			while loop over each word in the list
			if word matches regex
				submit to stream
			else if word contains delimiter chars
				Find index of first delimiter
				make current index substring up to, but not including delimiter
				add string from delimiter on to list after current index
				relex the current word
			else
				error?

			Need to combine strings with spaces somehow

		*/

		// TODO: Remove log messages when finished
		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string, symbolTable: SymbolTable): Token [] {

			this.setupTokenPatterns();

			Logger.log("Performing lexical analysis");

			var currentToken: Token = new Token();

			var currentChar: string = "";
			var currentWord: string = "";

			var currentIndex: number = 0;

			var logCurrentLetter: number = 1;
			var logCurrentLine: number = 1;
			var logWarningCount: number = 0;

			var isPrefix: boolean = false;


			// TODO: Remove above this eventually


			var tokenList: Token[] = [];

			var stringMode: boolean = false;
			var eofFound: boolean = false;

			var splitCodeList: string [] = this.splitCodeOnSpaces(inputCode);

			var delimiterFound: boolean = false;

			var word: string = "";
			var wordIndex: number = 0;

			// Further split the code on delimiters
			while(wordIndex !== splitCodeList.length) {

				word = splitCodeList[wordIndex];

				for(var charIndex: number = 0; charIndex !== word.length && word.length !== 1; charIndex++) {

					var currentChar: string = word.charAt(charIndex);

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

						var subStringBefore: string = word.substring(0, beforeIndex);
						var subStringAfter: string = word.substring(afterIndex, word.length);

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
						var subStringAfter: string = word.substring(1, word.length);

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

			// TODO: Make it so you can combine words (ex: ! and =, = and =)
			// Tokenize the individual elements of the split up code now
			var listIndex: number = 0;

			while(listIndex !== splitCodeList.length) {

				word = splitCodeList[listIndex];

				var tokenMatched: TokenMatch = this.matchesTokenPattern(word);

				if(tokenMatched.isMatch) {

					var token: Token = tokenMatched.token;

					if(token.getType() === TokenType.T_QUOTE) {

						stringMode = stringMode ? false : true;
					}

					// T_ID and T_CHAR share same regex, so swap on the spot
					if(stringMode && token.getType() === TokenType.T_ID) {
						token.setType(TokenType.T_CHAR);
					}

					Logger.log(word + " matched a regex");
					Logger.log("Type was " + tokenMatched.token.getTokenName());

					tokenList.push(token);
				}

				else {

					var errorMessage: string = "Error! " + word + " is not a valid lexeme.";

					Logger.log(errorMessage);
					throw errorMessage;
				}

				listIndex++;
			}

			return tokenList;


			// TODO: Delete rest of method once new version implemented

			// Lex the code
			while(currentIndex != inputCode.length && !eofFound) {

				currentChar = inputCode[currentIndex];
				currentIndex++;

				currentWord += currentChar;

				// Attempt to find match for token
				var tokenMatched: TokenMatch = this.matchesTokenPattern(currentWord);

				// Disregard old token if new match was found 
				if(tokenMatched.token.getType() !== TokenType.T_NO_MATCH) {
					currentToken = tokenMatched.token;
				}

				if(tokenMatched.isMatch) {

					Logger.log("Token found: " + currentToken.getTokenName());

					if(currentToken.getType() === TokenType.T_QUOTE) {

						if(!stringMode) {

							stringMode = true;

							Logger.log("Producing token: " + currentToken.getTokenName());
							tokenList.push(currentToken);

							currentToken = new Token();
							currentWord = "";
						}

						else {

							stringMode = false;
						}
					}

					if(stringMode && currentToken.getType() !== TokenType.T_DEFAULT) {

						// T_ID shares same regex as T_CHAR, so convert on the spot
						if(currentToken.getType() === TokenType.T_ID) {
							currentToken.setType(TokenType.T_CHAR);
						}

						if(currentToken.getType() === TokenType.T_CHAR) {

							Logger.log("Producing token: " + currentToken.getTokenName());
							tokenList.push(currentToken);
						}

						else if(currentToken.getType() === TokenType.T_WHITE_SPACE && currentToken.getValue() === " ") {

							Logger.log("Producing token: " + currentToken.getTokenName());
							tokenList.push(currentToken);
						}

						else {

							var errorMessage: string = "Error on line " + logCurrentLine + ", character " + logCurrentLetter + ": " + currentWord + " is a not valid string character";

							Logger.log(errorMessage);
							throw errorMessage;
						}

						currentToken = new Token();
						currentWord = "";
					}

					isPrefix = false;
				}

				else if(symbolTable.hasReservedWordPrefix(currentWord)) {
					isPrefix = true;
				}

				else {

					if(currentToken.getType() !== TokenType.T_DEFAULT) {

						if(currentToken.getType() === TokenType.T_EOF) {
							eofFound = true;
						}

						// Discard whitespace tokens
						if(currentToken.getType() !== TokenType.T_WHITE_SPACE && !isPrefix) {

							Logger.log("Producing token: " + currentToken.getTokenName());
							tokenList.push(currentToken);

							// TODO: Remove when doing project 2?
							if(currentToken.getType() === TokenType.T_ID) {

								Logger.log("Adding " + currentToken.getTokenName() + " to the symbol table");
								symbolTable.insert(currentToken);
							}
						}

						currentWord = "";
						currentToken = new Token();

						// Back up and re-lex the current character
						currentIndex--;
						logCurrentLetter--;

						if(currentChar === "\n") {
							logCurrentLine--;
						}

						isPrefix = false;
					}

					// Not a valid lexeme 
					else {

						var errorMessage: string = "Error on line " + logCurrentLine + ", character " + logCurrentLetter + ": " + currentWord + " is a not valid lexeme";

						Logger.log(errorMessage);
						throw errorMessage;
					}
				}

				// Final token processing
				if(currentIndex === inputCode.length) {

					if(currentToken.getType() !== TokenType.T_DEFAULT && currentToken.getType() !== TokenType.T_WHITE_SPACE && !isPrefix) {

						// Disregard prefixes
						Logger.log("Producing token: " + currentToken.getTokenName());
						tokenList.push(currentToken);
					}

					if(currentToken.getType() === TokenType.T_EOF) {
						eofFound = true;
					}
				}

				logCurrentLetter++;

				if(currentChar === "\n") {

					logCurrentLine++;
					logCurrentLetter = 0;
				}
			}

			if(eofFound) {

				var whitespaceRegex: RegExp = /[\s|\n]/;
				var indexAfterEOF: number = inputCode.indexOf("$") + 1;

				for(currentIndex = indexAfterEOF; currentIndex < inputCode.length; currentIndex++) {

					currentChar = inputCode[currentIndex];

					if(!(whitespaceRegex.test(currentChar))) {

						Logger.log("Warning on line " + logCurrentLine + ", character " + logCurrentLetter + ": Input found after EOF character");
						logWarningCount++;

						break;
					}

					logCurrentLetter++;

					if(currentChar === "\n") {
						logCurrentLetter = 0;
						logCurrentLine++;
					}
				}
			}

			else {

				Logger.log("Warning! EOF character was not found. Adding it to the list");
				logWarningCount++;

				var eofToken: Token = new Token();
				eofToken.setType(TokenType.T_EOF);

				tokenList.push(eofToken);
			}

			Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s)");

			return tokenList;
		}

		// Looks for a regex match for the word, and if it does, produces a token of the type to be returned
		// in the currentToken formal parameter
		private static matchesTokenPattern(currentWord: string): TokenMatch {

			var returnTokenMatch: TokenMatch = new TokenMatch();
			var patternMatched: boolean = false;

			// Check if currentWord matches any regex for a token
			for(var i: number = 0; i < this.tokenPatterns.length && !patternMatched; i++) {

				var tokenRegex: RegExp = this.tokenPatterns[i].regex;
				var tokenType: TokenType = this.tokenPatterns[i].type;

				if(tokenRegex.test(currentWord)) {

					patternMatched = true;

					var currentToken: Token = new Token();
					currentToken.setType(tokenType);
					currentToken.setValue(currentWord);

					returnTokenMatch.token = currentToken;
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
				{regex: /^[\s|\n]$/, type: TokenType.T_WHITE_SPACE},
			];

			this.delimiterChars = /^[\{\}\(\_\)\$\"0-9!=+]$/;
		}

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

				// Whitespace
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

						Logger.log("Submitting " + currentWord);
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