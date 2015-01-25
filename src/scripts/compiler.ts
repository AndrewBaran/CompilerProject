module TSCompiler {
	
	export class Compiler {

		public static compile(): boolean {

			console.log("In compile()");

			// Grab the code from the code textbox
			var compileResult: boolean = false;
			var codeToCompile: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			console.log("Compiling the following code: " + codeToCompile);

			// Pass the code to the lexer
			// TODO: Need to pass back boolean value to see if lex was successful
			var tokenList: Token[] = Lexer.tokenizeCode(codeToCompile);

			// Return flag if compile was successful
			return compileResult;
		}
	}
}