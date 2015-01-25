module Compiler {
	
	export class Lexer {

		// Separates the input code into a list of tokens and returns that list
		public static tokenizeCode(inputCode: string): Token [] {

			console.log("In tokenizeCode()");
			Logger.write("Performing lexical analysis");

			var tokenList: Token[] = [];

			// TODO: Actually lex the code

			return tokenList;
		}
	}
}
