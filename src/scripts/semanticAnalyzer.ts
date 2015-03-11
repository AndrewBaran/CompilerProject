module Compiler {

	export class SemanticAnalyzer {

		private static abstractSyntaxTree: AbstractSyntaxTree;


		public static analyze(concreteSyntaxTree: ConcreteSyntaxTree, symbolTable: SymbolTable): AbstractSyntaxTree {

			Logger.log("Performing Semantic Analysis");
			Logger.log("");

			this.setupAnalysisEnvironment();

			this.createAST();
			this.scopeCheck();
			this.typeCheck();

			return this.abstractSyntaxTree;
		}

		private static setupAnalysisEnvironment(): void {
			this.abstractSyntaxTree = new AbstractSyntaxTree();
		}

		private static createAST(): void {

			Logger.log("Creating the Abstract Syntax Tree");
		}

		private static scopeCheck(): void {

			Logger.log("Performing Scope Checking");
		}

		private static typeCheck(): void {

			Logger.log("Performing Type Checking");
		}

	}
}