module Compiler {

	export class SemanticAnalyzer {

		private static abstractSyntaxTree: AbstractSyntaxTree;
        private static symbolTable: SymbolTable;


		public static analyze(concreteSyntaxTree: ConcreteSyntaxTree, symbolTable: SymbolTable): AbstractSyntaxTree {

			Logger.log("Performing Semantic Analysis");
			Logger.log("");

			this.setupAnalysisEnvironment(symbolTable);

			this.createAST(concreteSyntaxTree);
			this.scopeCheck();
			this.typeCheck();

            this.printWarnings();

			return this.abstractSyntaxTree;
		}

		private static setupAnalysisEnvironment(symbolTable: SymbolTable): void {

			this.abstractSyntaxTree = new AbstractSyntaxTree();
            this.symbolTable = symbolTable;
		}

		private static createAST(concreteSyntaxTree: ConcreteSyntaxTree): void {

			Logger.log("Creating the Abstract Syntax Tree");
			this.abstractSyntaxTree = concreteSyntaxTree.buildAST();
		}

		private static scopeCheck(): void {

			Logger.log("Performing Scope Checking");
            this.abstractSyntaxTree.buildSymbolTable(this.symbolTable);
		}

		private static typeCheck(): void {

			Logger.log("Performing Type Checking (NOT IMPLEMENTED)");
		}

		private static printWarnings(): void {
            this.symbolTable.printWarnings();
		}

	}
}