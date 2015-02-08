module Compiler {
	
	export class Lexer {

		// TODO: Give this a type eventually
		private static tokenPatterns; 

		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string, symbolTable: SymbolTable): Token [] {

			this.setupTokenPatterns();

			Logger.log("Performing lexical analysis");

			var tokenList: Token[] = [];
			var currentToken: Token = null;

			var currentChar: string = "";
			var currentWord: string = "";

			var currentIndex: number = 0;

			// Lex the code
			while(currentIndex != inputCode.length) {

				currentChar = inputCode[currentIndex];
				currentIndex++;

				Logger.log("Char: " + currentChar);

				var patternMatched: boolean = false;

				// If currentChar is a token delimiter (whitespace, ( ) { } = " ! + etc)
				//		If whitespace token, do other stuff (TODO)
				//			Act like whitespace is one big token, continue lexing
				//		Else
				//			Submit token to stream
				//			Reset token
				// Add currentChar to the word
				// Test the word against all regexes
				//		If no matches, check for match against prefix of reserved word
				//			If reserved word, continue lexing
				//			If not, then error out
				// Take the longest currently matching regex	

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

						Logger.log("Current token: " + TokenType[currentToken.type]);
						Logger.log("Adding it to the stream");

						tokenList.push(currentToken);

						// Reset tokens
						currentToken = new Token(TokenType.T_WHITE_SPACE, "");
						currentWord = "";
					}
				}

				// Check if current token is whitespace
				else if(currentToken != null && currentToken.type == TokenType.T_WHITE_SPACE) {

					Logger.log("Non-whitespace found.");
					Logger.log("Discarding current token: " + TokenType[currentToken.type]);

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

					if(symbolTable.hasReservedWordPrefix(currentWord)) {

						Logger.log(currentWord + " is a prefix of a reserved word. Continue lexing.");
					}
				}

			} // while

			return tokenList;
		}

		private static setupTokenPatterns(): void {

			this.tokenPatterns = [
				{regex: /while/, type: TokenType.T_WHILE},
				{regex: /if/, type: TokenType.T_IF},
				{regex: /true/, type: TokenType.T_TRUE},
				{regex: /false/, type: TokenType.T_FALSE},
				{regex: /int/, type: TokenType.T_INT},
				{regex: /string/, type: TokenType.T_STRING},
				{regex: /boolean/, type: TokenType.T_BOOLEAN},
				{regex: /print/, type: TokenType.T_PRINT},
				{regex: /\(/, type: TokenType.T_LPAREN},
				{regex: /\)/, type: TokenType.T_LPAREN},
				{regex: /\{/, type: TokenType.T_LBRACE},
				{regex: /\}/, type: TokenType.T_RBRACE},
				{regex: /"/, type: TokenType.T_QUOTE},
				{regex: /[a-z]/, type: TokenType.T_ID},
				{regex: /[0-9]/, type: TokenType.T_DIGIT},
				{regex: /\+/, type: TokenType.T_PLUS},
				{regex: /\$/, type: TokenType.T_EOF},
				{regex: /=/, type: TokenType.T_SINGLE_EQUALS},
				{regex: /==/, type: TokenType.T_DOUBLE_EQUALS},
				{regex: /!=/, type: TokenType.T_NOT_EQUALS},
				{regex: /\$/, type: TokenType.T_EOF},
				{regex: /\s+/, type: TokenType.T_WHITE_SPACE},
			];

		}
	}
}
