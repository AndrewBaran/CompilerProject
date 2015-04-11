module Compiler {

	export class SemanticAnalyzer {

		private static abstractSyntaxTree: AbstractSyntaxTree;


		public static analyze(concreteSyntaxTree: ConcreteSyntaxTree, symbolTable: SymbolTable): AbstractSyntaxTree {

			Logger.log("Performing Semantic Analysis");
			Logger.log("");

			this.setupAnalysisEnvironment();

			this.createAST(concreteSyntaxTree);
			this.scopeCheck();
			this.typeCheck();

			return this.abstractSyntaxTree;
		}

		// TODO: Add Symbol table
		private static setupAnalysisEnvironment(): void {
			this.abstractSyntaxTree = new AbstractSyntaxTree();
		}

		private static createAST(concreteSyntaxTree: ConcreteSyntaxTree): void {

			Logger.log("Creating the Abstract Syntax Tree");
			this.abstractSyntaxTree = concreteSyntaxTree.buildAST();
		}

		private static scopeCheck(): void {

			Logger.log("Performing Scope Checking (NOT IMPLEMENTED)");
		}

		private static typeCheck(): void {

			Logger.log("Performing Type Checking (NOT IMPLEMENTED)");
		}

	}
}