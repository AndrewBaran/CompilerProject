module Compiler {
	
	export class Lexer {

		// TODO: Probably refactor this somewhere else
		private static tokenPatterns; 

		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string): Token [] {

			// TODO: Maybe move to another unit?
			this.setupRegexPatterns();

			Logger.log("Performing lexical analysis");

			var tokenList: Token[] = [];
			var currentToken: Token = null;

			var currentChar: string = "";
			var currentWord: string = "";

			var currentIndex: number = 0;

			// TODO: Primitive lexer; doesn't work correctly
			// Lex the code
			while(currentIndex != inputCode.length) {

				currentChar = inputCode[currentIndex];
				currentIndex++;

				Logger.log("Char: " + currentChar);

				var patternMatched: boolean = false;

				// See if currentChar is whitespace
				if(/\s/.test(currentChar)) {

					Logger.log("Found a whitespace.");

					// See if currentToken is null
					if(currentToken == null) {

						currentToken = new Token(TokenType.T_WHITE_SPACE, "");
						Logger.log("Creating token of type whitespace");
					}

					// Move current token to stream
					else {

						Logger.log("Current token: " + currentToken.type);
						Logger.log("Adding it to the stream");

						tokenList.push(currentToken);

						// Reset tokens
						currentToken = new Token(TokenType.T_WHITE_SPACE, "");
						currentWord = "";
					}
				}

				// Check if current token is whitespace
				else if(currentToken != null && currentToken.type == TokenType.T_WHITE_SPACE) {

					Logger.log("Found nonwhite space after whitespace tokens. Rejecting this whitespace token.");

					// Reset token
					currentToken = null;
					currentWord = "";
				}

				currentWord += currentChar;

				// Check if currentWord matches any regex for a token
				for(var i: number = 0; i < this.tokenPatterns.length && !patternMatched; i++) {

					var tokenRegex: RegExp = this.tokenPatterns[i].regex;
					var tokenType: TokenType = this.tokenPatterns[i].type;

					// Regex passed
					if(tokenRegex.test(currentWord)) {

						patternMatched = true;

						// TODO: If token, like int or string, then look for more matches
						Logger.log(currentWord + " matched the regex " + tokenRegex);

						// Enum is treated as array, so index it with enum type to get name of token
						Logger.log("Token matched: " + TokenType[tokenType]);

						currentToken = new Token(tokenType, "");
					}

				}

				if(!patternMatched) {
					Logger.log("No patterns matched.");
				}

			} // while

			return tokenList;
		}

		// TODO: Refactor regex patterns to dynamically load from a (global) array containing all of this
		// Set up patterns that will match tokens
		private static setupRegexPatterns(): void {

			this.tokenPatterns = [
				{regex: /while/, type: TokenType.T_WHILE},
				{regex: /if/, type: TokenType.T_IF},
				{regex: /\(/, type: TokenType.T_LPAREN},
				{regex: /\)/, type: TokenType.T_LPAREN},
				{regex: /\{/, type: TokenType.T_LBRACE},
				{regex: /\}/, type: TokenType.T_RBRACE},
				{regex: /"/, type: TokenType.T_QUOTE},
				{regex: /int/, type: TokenType.T_INT},
				{regex: /string/, type: TokenType.T_STRING},
				{regex: /boolean/, type: TokenType.T_BOOLEAN},
				{regex: /print/, type: TokenType.T_PRINT},
				{regex: /[a-z]/, type: TokenType.T_CHAR},
				{regex: /[0-9]/, type: TokenType.T_DIGIT},
				{regex: /\+/, type: TokenType.T_PLUS},
				{regex: /\$/, type: TokenType.T_EOF},
				{regex: /=/, type: TokenType.T_SINGLE_EQUALS},
				{regex: /==/, type: TokenType.T_DOUBLE_EQUALS},
				{regex: /!=/, type: TokenType.T_NOT_EQUALS},
				{regex: /true/, type: TokenType.T_TRUE},
				{regex: /false/, type: TokenType.T_FALSE},
				{regex: /\s+/, type: TokenType.T_WHITE_SPACE}
			];

		}
	}
}
