module Compiler {
	
	export class Lexer {

		// TODO: Probably refactor this somewhere else
		private static tokenPatterns: RegExp [];

		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string): Token [] {

			// TODO: Maybe move to another unit?
			this.setupRegexPatterns();

			console.log("In tokenizeCode()");
			Logger.log("Performing lexical analysis");

			var tokenList: Token[] = [];

			var currentChar: string = "";
			var currentIndex: number = 0;
			var currentWord: string = "";

			// TODO: Primitive lexer; doesn't work correctly
			// Lex the code
			while(inputCode.length > 0 && (currentChar = inputCode[currentIndex]) != "$") {

				console.log("Found char: " + currentChar);
				currentIndex++;

				// Not whitespace
				if(!(/\s/.test(currentChar))) {

					console.log("Current word: " + currentWord);
					currentWord += currentChar;
				}

				else {

					var token: Token = new Token("", currentWord);
					tokenList.push(token);
					currentWord = "";

					Logger.log("Found lexeme: " + token.value);
				}
			}

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
		}
	}
}
