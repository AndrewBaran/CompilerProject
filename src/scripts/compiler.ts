module Compiler {
	
	export class Compiler {

		// Flags used by the compiler
		private static debugMode: boolean;

		public static compile(): boolean {

			this.setCompilerFlags();

			var compileResult: boolean = false;
			var codeToCompile: string = (<HTMLInputElement> document.getElementById("textboxInputCode")).value;

			// No available code to lex
			if(codeToCompile.length == 0) {

				Logger.log("Error! No code present to compile");
			}

			else {

				// TODO: Need to pass back boolean value to see if lex was successful
				var tokenList: Token[] = Lexer.tokenizeCode(codeToCompile);
			}

			// TODO: Make debugging window appear that shows tokens received from lex

			// Return flag if compile was successful
			return compileResult;
		}

		// Set flags for use by the compiler (debug mode, etc.)
		private static setCompilerFlags(): void {

			var checkboxDebug = <HTMLInputElement> document.getElementById("checkboxDebug");
			this.debugMode = checkboxDebug.checked;

			if(this.debugMode) {
				Logger.log("Debug mode enabled");
			}

		}

		private static isDebugMode(): boolean {

			return this.debugMode;
		}

	}
}