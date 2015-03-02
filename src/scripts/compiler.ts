module Compiler {
	
	export class Compiler {

		private static debugMode: boolean;
		private static testMode: boolean;

		public static compile(codeToCompile: string): boolean {

			this.setCompilerFlags();

			var lexResult: boolean = false;
			var parseResult: boolean = false;
			var semanticResult: boolean = false;

			var tokenList: TokenInfo [] = [];
			var symbolTable: SymbolTable = new SymbolTable(); 
			var concreteSyntaxTree: ConcreteSyntaxTree = null;

			// No available code to lex
			if(codeToCompile.length == 0) {
				Logger.log("Error! No code present to compile");
			}

			else {

				try {

					tokenList = Lexer.tokenizeCode(codeToCompile, symbolTable);
					lexResult = true;
				}

				catch(exception) {
					lexResult = false;
				}
			}

			if(tokenList.length > 0 && lexResult) {

				if(!this.testMode) {
					Control.displayTokenTable(tokenList);
				}
				
				try {

					concreteSyntaxTree = Parser.parseCode(tokenList, symbolTable);
					parseResult = true;
				}

				catch(exception) {
					parseResult = false;
				}
			}

			if(parseResult) {

				if(!this.testMode) {
					Control.displaySymbolTable(symbolTable);
				}

				try {

					SemanticAnalyzer.analyze(concreteSyntaxTree, symbolTable);
					semanticResult = true;
				}

				catch(exception) {
					semanticResult = false;
				}
				
			}

			if(!this.testMode) {
				Control.displayCompilerResults(lexResult, parseResult, semanticResult);
			}

			// TODO: Return the AND of each compilation result
			return lexResult && parseResult && semanticResult;
		}

		// Set flags for use by the compiler (debug mode, etc.)
		private static setCompilerFlags(): void {

			var checkboxDebug = <HTMLInputElement> document.getElementById("checkboxDebug");
			this.debugMode = checkboxDebug.checked;

			if(this.debugMode) {

				Logger.log("Debug mode enabled");
				Logger.log("");
			}
		}

		public static setTestMode(isTestMode: boolean): void {
			this.testMode = isTestMode;
		}

	} // Compiler


	// Structs
	export class TokenInfo {

		public token: Token;
		public lineFoundOn: number;

		constructor() {

		}
	}
}