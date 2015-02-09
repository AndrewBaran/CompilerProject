module Compiler {
	
	export class Lexer {

		// TODO: Give this a type eventually
		private static tokenPatterns; 

		// TODO: Be able to lex strings
		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string, symbolTable: SymbolTable): Token [] {

			this.setupTokenPatterns();

			Logger.log("Performing lexical analysis");

			var tokenList: Token[] = [];
			var currentToken: Token = new Token();

			var currentChar: string = "";
			var currentWord: string = "";

			var currentIndex: number = 0;

			var logCurrentLetter: number = 1;
			var logCurrentLine: number = 1;

			var eofFound: boolean = false;

			// Lex the code
			while(currentIndex != inputCode.length && !eofFound) {

				currentChar = inputCode[currentIndex];
				currentIndex++;

				logCurrentLetter++;

				currentWord += currentChar;

				// For error reporting
				if(currentChar === "\n") {

					logCurrentLine++;
					logCurrentLetter = 0;
				}

				// Attempt to find match for token
				var tokenMatched: TokenMatch = this.matchesTokenPattern(currentWord);

				// Disregard old token if new match was found 
				if(tokenMatched.token.type !== TokenType.T_NO_MATCH) {
					currentToken = tokenMatched.token;
				}

				if(tokenMatched.isMatch) {
					Logger.log("Token found: " + TokenType[currentToken.type]);
				}

				else {

					// Didn't match a pattern
					if(!symbolTable.hasReservedWordPrefix(currentWord)) {

						if(currentToken.type !== TokenType.T_DEFAULT) {

							if(currentToken.type === TokenType.T_EOF) {
								eofFound = true;
							}

							// Discard whitespace tokens
							if(currentToken.type !== TokenType.T_WHITE_SPACE) {

								Logger.log("Producing token: " + TokenType[currentToken.type]);
								tokenList.push(currentToken);
							}

							currentWord = "";
							currentToken = new Token();

							// Back up and re-lex the current character
							currentIndex--;
							logCurrentLetter--;

							if(currentChar === "\n") {
								logCurrentLine--;
							}
						}

						// Not a valid lexeme 
						else {

							var errorMessage: string = "Error on line " + logCurrentLine + ", character " + logCurrentLetter + ": " + currentWord + " is a not valid lexeme.";

							Logger.log(errorMessage);
							throw errorMessage;
						}
					}
				}

			}

			// TODO: Refactor into while loop
			// Extract last token from lex
			if(currentToken.type !== TokenType.T_DEFAULT) {

				Logger.log("Producing token: " + TokenType[currentToken.type]);
				tokenList.push(currentToken);
			}

			var whitespaceRegex: RegExp = /[\s|\n]/;

			// Check for input beyond EOF char
			var indexAfterEOF: number = inputCode.indexOf("$") + 1;

			for(currentIndex = indexAfterEOF; currentIndex < inputCode.length; currentIndex++) {

				currentChar = inputCode[currentIndex];

				if(!(whitespaceRegex.test(currentChar))) {

					Logger.log("Warning! Input found after EOF character.");
					break;
				}
			}

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
					currentToken.type = tokenType;

					returnTokenMatch.token = currentToken;
				}
			}

			returnTokenMatch.isMatch = patternMatched;
			return returnTokenMatch;
		}

		private static setupTokenPatterns(): void {

			this.tokenPatterns = [
				{regex: /^while$/g, type: TokenType.T_WHILE},
				{regex: /^if$/g, type: TokenType.T_IF},
				{regex: /^true$/g, type: TokenType.T_TRUE},
				{regex: /^false$/g, type: TokenType.T_FALSE},
				{regex: /^int$/g, type: TokenType.T_INT},
				{regex: /^string$/g, type: TokenType.T_STRING},
				{regex: /^boolean$/g, type: TokenType.T_BOOLEAN},
				{regex: /^print$/g, type: TokenType.T_PRINT},
				{regex: /^\($/g, type: TokenType.T_LPAREN},
				{regex: /^\)$/g, type: TokenType.T_RPAREN},
				{regex: /^\{$/g, type: TokenType.T_LBRACE},
				{regex: /^\}$/g, type: TokenType.T_RBRACE},
				{regex: /^"$/g, type: TokenType.T_QUOTE},
				{regex: /^[a-z]$/g, type: TokenType.T_ID},
				{regex: /^[0-9]$/g, type: TokenType.T_DIGIT},
				{regex: /^\+$/g, type: TokenType.T_PLUS},
				{regex: /^\$$/g, type: TokenType.T_EOF},
				{regex: /^=$/g, type: TokenType.T_SINGLE_EQUALS},
				{regex: /^==$/g, type: TokenType.T_DOUBLE_EQUALS},
				{regex: /^!=$/g, type: TokenType.T_NOT_EQUALS},
				{regex: /^[\s|\n]+$/g, type: TokenType.T_WHITE_SPACE},
			];

		}
	}

	export class TokenMatch {

		public token: Token;
		public isMatch: boolean;

		constructor() {

			this.token = new Token();
			this.token.type = TokenType.T_NO_MATCH;
			this.isMatch = false;
		}
	}
}