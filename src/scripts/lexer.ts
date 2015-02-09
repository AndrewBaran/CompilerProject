module Compiler {
	
	export class Lexer {

		// TODO: Give this a type eventually
		private static tokenPatterns; 

		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string, symbolTable: SymbolTable): Token [] {

			this.setupTokenPatterns();

			Logger.log("Performing lexical analysis");

			var tokenList: Token[] = [];
			var currentToken: Token = new Token();

			var currentChar: string = "";
			var currentWord: string = "";

			var currentIndex: number = 0;

			var currentLine: number = 1;
			var eofFound: boolean = false;

			// Lex the code
			while(currentIndex != inputCode.length && !eofFound) {

				currentChar = inputCode[currentIndex];
				currentIndex++;

				Logger.log("Char: \"" + currentChar + "\"");
				currentWord += currentChar;

				// Update counter for error reporting
				if(currentChar === "\n") {
					currentLine++;
				}

				var tokenMatched: TokenMatch = this.matchesTokenPattern(currentWord);

				if(tokenMatched.token.type !== TokenType.T_NO_MATCH) {
					currentToken = tokenMatched.token;
				}

				Logger.log("Current = " + TokenType[currentToken.type]);

				if(tokenMatched.isMatch) {

					Logger.log("Token matched was: " + TokenType[currentToken.type]);
				}

				else {

					// Didn't match a pattern
					if(symbolTable.hasReservedWordPrefix(currentWord)) {
						Logger.log(currentWord + " is a prefix of a reserved word.");
					}

					// Not a prefix
					else {

						if(currentToken.type !== TokenType.T_DEFAULT) {

							Logger.log("Adding to token stream and reseting words.");

							tokenList.push(currentToken);

							currentWord = "";
							currentToken = new Token();

							// Back up and re-lex the same character
							currentIndex--;
						}

						else {

							var errorMessage: string = "Error on line " + currentLine + ": " + currentWord + " is a not valid lexeme.";

							Logger.log(errorMessage);
							throw errorMessage;
						}
					}
				}

			} // while

			// Extract last token
			if(currentToken.type !== TokenType.T_DEFAULT) {
				tokenList.push(currentToken);
			}

			// TODO: Routine to check for input beyond the EOF

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

				// Regex passed
				if(tokenRegex.test(currentWord)) {

					patternMatched = true;

					Logger.log(currentWord + " matched the regex " + tokenRegex);

					// Enum is treated as array, so index it with enum type to get name of token
					Logger.log("Token matched: " + TokenType[tokenType]);

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
				{regex: /^\)$/g, type: TokenType.T_LPAREN},
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
