module TSCompiler {
	export class Compiler {

		public static compile(): void {

			console.log("In compile()");

			// Grab the code from the code textbox
			var codeToCompile: string = (<HTMLInputElement>document.getElementById("textboxInputCode")).value;

			console.log("Compiling the following code: " + codeToCompile);

			// Pass the code to the lexer
			Lexer.tokenizeCode(codeToCompile);
		}
	}
}