var Compiler;
(function (Compiler) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer() {
        }
        SemanticAnalyzer.analyze = function (concreteSyntaxTree, symbolTable) {
            Compiler.Logger.log("Performing Semantic Analysis");
            Compiler.Logger.log("");

            this.setupAnalysisEnvironment(symbolTable);

            this.createAST(concreteSyntaxTree);
            Compiler.Control.displayAST(this.abstractSyntaxTree);

            this.scopeCheck();
            this.typeCheck();

            Compiler.Logger.logVerbose("");
            Compiler.Logger.log("Semantic Analysis Complete");

            this.printWarnings();

            return this.abstractSyntaxTree;
        };

        SemanticAnalyzer.setupAnalysisEnvironment = function (symbolTable) {
            this.abstractSyntaxTree = new Compiler.AbstractSyntaxTree();
            this.symbolTable = symbolTable;
        };

        SemanticAnalyzer.createAST = function (concreteSyntaxTree) {
            this.abstractSyntaxTree = concreteSyntaxTree.buildAST();
        };

        SemanticAnalyzer.scopeCheck = function () {
            this.abstractSyntaxTree.buildSymbolTable(this.symbolTable);
        };

        SemanticAnalyzer.typeCheck = function () {
            this.abstractSyntaxTree.typeCheck(this.symbolTable);
        };

        SemanticAnalyzer.printWarnings = function () {
            this.symbolTable.detectWarnings();

            var warningCount = _semanticWarnings.length;

            Compiler.Logger.log("Semantic Analysis produced 0 errors and " + warningCount + " warning(s)");
            Compiler.Logger.log("");

            if (warningCount > 0) {
                Compiler.Logger.log("Warnings");
                Compiler.Logger.log("-----------------");

                for (var i = 0; i < warningCount; i++) {
                    Compiler.Logger.log(_semanticWarnings[i]);
                }
            }
        };
        return SemanticAnalyzer;
    })();
    Compiler.SemanticAnalyzer = SemanticAnalyzer;
})(Compiler || (Compiler = {}));
