module Compiler {
	
	export class Compiler {

		public static compile(): boolean {

			console.log("In compile()");

			var compileResult: boolean = false;
			var codeToCompile: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			// Pass the code to the lexer
			// TODO: Need to pass back boolean value to see if lex was successful
			var tokenList: Token[] = Lexer.tokenizeCode(codeToCompile);

			// TODO: Make debugging window appear that shows tokens received from lex

			// Return flag if compile was successful
			return compileResult;
		}
	}
}