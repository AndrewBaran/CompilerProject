module Compiler {
	
	export class Compiler {

		private static symbolTable: SymbolTable;

		private static debugMode: boolean;
		private static parseMode: boolean;

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

			if(tokenList.length > 0 && lexResult) {

				if(this.debugMode) {
					Control.debugCreateTokenDiv(tokenList);
					Control.debugCreateSymbolTableDiv(this.symbolTable);
				}

				if(this.parseMode) {
					Parser.parseCode(tokenList, this.symbolTable);
				}

			}

			return compileResult;
		}

		// Set flags for use by the compiler (debug mode, etc.)
		private static setCompilerFlags(): void {

			var checkboxDebug = <HTMLInputElement> document.getElementById("checkboxDebug");
			this.debugMode = checkboxDebug.checked;

			if(this.debugMode) {
				Logger.log("Debug mode enabled");
			}

			var checkboxParse = <HTMLInputElement> document.getElementById("checkboxParse");
			this.parseMode = checkboxParse.checked;
		}

		private static isDebugMode(): boolean {

			return this.debugMode;
		}

	}
}