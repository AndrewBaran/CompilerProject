module Compiler {
	
	export class Compiler {

		private static symbolTable: SymbolTable;

		private static debugMode: boolean;


		public static compile(codeToCompile: string): boolean {

			this.symbolTable = new SymbolTable();
			this.setCompilerFlags();

			var lexResult: boolean = true;
			var compileResult: boolean = true;

			var tokenList: Token[] = [];

			// No available code to lex
			if(codeToCompile.length == 0) {

				Logger.log("Error! No code present to compile");
			}

			else {

				try {
					tokenList = Lexer.tokenizeCode(codeToCompile, this.symbolTable);
				}

				catch(exception) {
					lexResult = false;
				}
			}

			// Show tokens produced
			if(this.debugMode && tokenList.length > 0 && lexResult) {

				Control.debugCreateTokenDiv(tokenList);
			}

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