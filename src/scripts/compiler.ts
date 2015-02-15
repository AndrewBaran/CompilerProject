module Compiler {
	
	export class Compiler {

		private static symbolTable: SymbolTable;

		private static debugMode: boolean;
		private static parseMode: boolean;
		private static testMode: boolean;

		public static compile(codeToCompile: string): boolean {

			this.symbolTable = new SymbolTable();
			this.setCompilerFlags();

			var lexResult: boolean = true;
			var parseResult: boolean = true;
			var compileResult: boolean = true;

			var tokenList: Token[] = [];
			var concreteSyntaxTree: ConcreteSyntaxTree = null;

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

				if(!this.testMode) {

					if(this.debugMode) {

						Control.debugCreateTokenDiv(tokenList);
					}

					Control.debugCreateSymbolTableDiv(this.symbolTable);
				}
				
				if(this.parseMode) {

					try {
						concreteSyntaxTree = Parser.parseCode(tokenList, this.symbolTable);
					}

					catch(exception) {
						parseResult = false;
					}
				}

			}

			if(parseResult) {

				// TOOD: Semantic analysis
			}

			// TODO: Return the AND of each compilation result
			return lexResult && parseResult;
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

		public static setTestMode(isTestMode: boolean): void {

			this.testMode = isTestMode;
		}

	}
}