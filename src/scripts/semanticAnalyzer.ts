module Compiler {

	export class SemanticAnalyzer {

		// TODO: Return AbstractSyntaxTree
		public static analyze(concreteSyntaxTree: ConcreteSyntaxTree, symbolTable: SymbolTable): void {

			Logger.log("Performing Semantic Analysis");
			Logger.log("");

			this.scopeCheck();
			this.typeCheck();
			this.createAST();

		}

		private static scopeCheck(): void {

			Logger.log("Performing Scope Checking");

		}

		private static typeCheck(): void {

			Logger.log("Performing Type Checking");

		}

		private static createAST(): void {

			Logger.log("Creating the Abstract Syntax Tree");

		}
	}
}