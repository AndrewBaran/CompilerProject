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

            Logger.logVerbose("");
            Logger.log("Semantic Analysis Complete");

            this.printWarnings();

			return this.abstractSyntaxTree;
		}

		private static setupAnalysisEnvironment(symbolTable: SymbolTable): void {

			this.abstractSyntaxTree = new AbstractSyntaxTree();
            this.symbolTable = symbolTable;
		}

		private static createAST(concreteSyntaxTree: ConcreteSyntaxTree): void {
			this.abstractSyntaxTree = concreteSyntaxTree.buildAST();
		}

		private static scopeCheck(): void {
            this.abstractSyntaxTree.buildSymbolTable(this.symbolTable);
		}

		private static typeCheck(): void {
            this.abstractSyntaxTree.typeCheck(this.symbolTable);
		}

		private static printWarnings(): void {
            
            this.symbolTable.detectWarnings();

            var warningCount: number = _semanticWarnings.length;

            Logger.log("Semantic Analysis produced 0 errors and " + warningCount + " warning(s)");
            Logger.log("");

            if(warningCount > 0) {

                Logger.log("Warnings");
                Logger.log("-----------------");

                for(var i: number = 0; i < warningCount; i++) {
                    Logger.log(_semanticWarnings[i]);
                }
            }

		}

	}
}