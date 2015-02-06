module Compiler {
	
	export class Lexer {

		// TODO: Probably refactor this somewhere else
		private static tokenPatterns: RegExp [];

		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string): Token [] {

			// TODO: Maybe move to another unit?
			this.setupRegexPatterns();

			// TODO Incorporate this into setupRegexPatterns
			var whitespaceRegex: RegExp = /\s+/g;

			Logger.log("Performing lexical analysis");

			var tokenList: Token[] = [];
			var currentToken: Token = null;

			var currentChar: string = "";
			var currentIndex: number = 0;
			var currentWord: string = "";

			// TODO: Primitive lexer; doesn't work correctly
			// Lex the code
			while(currentIndex != inputCode.length) {

				currentChar = inputCode[currentIndex];
				currentIndex++;

				Logger.log("Found char: " + currentChar);

				var patternMatched: boolean = false;

				// See if currentChar is whitespace
				if(whitespaceRegex.test(currentChar)) {

					Logger.log("Found a whitespace.");

					// See if currentToken is null
					if(currentToken == null) {

						currentToken = new Token(TokenType.T_WHITE_SPACE, "b");

						Logger.log("Creating token of type whitespace");
					}

					// Move current token to stream
					else {

						Logger.log("Current token: " + currentToken.type);
						Logger.log("Adding it to the stream");

						tokenList.push(currentToken);

						// Reset tokens
						currentToken = new Token(TokenType.T_WHITE_SPACE, "b");
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

					var regex: RegExp = this.tokenPatterns[i];

					// Passed regex
					if(regex.test(currentWord)) {

						patternMatched = true;

						// If token, like int or string, then look for more matches
						Logger.log(currentWord + " matched a word.");
						Logger.log("Regex that matched it: " + regex);

						// TODO Test values
						currentToken = new Token(1, "b");
					}

				} // for

				if(!patternMatched) {
					Logger.log("No patterns matched.");
				}

			} // while

			return tokenList;
		}

		// TODO: Refactor regex patterns to dynamically load from a (global) array containing all of this
		// Set up patterns that will match tokens
		private static setupRegexPatterns(): void {

			// Prevent repeats of the same regexs
			this.tokenPatterns = [];

			// TODO: THIS IS PROBABLY NOT HOW YOU DO THIS
			// Add each regex and associated token
			this.tokenPatterns.push(/while/);
			this.tokenPatterns.push(/if/);
			this.tokenPatterns.push(/\(/);
			this.tokenPatterns.push(/\)/);
			this.tokenPatterns.push(/\{/);
			this.tokenPatterns.push(/\}/);
			this.tokenPatterns.push(/int/);
			this.tokenPatterns.push(/string/);
			this.tokenPatterns.push(/boolean/);
			this.tokenPatterns.push(/[a-z]/);
			this.tokenPatterns.push(/[0-9]/);
			this.tokenPatterns.push(/\+/);
			this.tokenPatterns.push(/\$/);
			this.tokenPatterns.push(/==/);
			this.tokenPatterns.push(/!=/);
			this.tokenPatterns.push(/true/);
			this.tokenPatterns.push(/false/);
			this.tokenPatterns.push(/"/);

		}
	}
}
