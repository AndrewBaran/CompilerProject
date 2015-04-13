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
            this.scopeCheck();
            this.typeCheck();

            this.printWarnings();

            Compiler.Logger.log("Semantic Analysis Complete");

            return this.abstractSyntaxTree;
        };

        SemanticAnalyzer.setupAnalysisEnvironment = function (symbolTable) {
            this.abstractSyntaxTree = new Compiler.AbstractSyntaxTree();
            this.symbolTable = symbolTable;
        };

        SemanticAnalyzer.createAST = function (concreteSyntaxTree) {
            Compiler.Logger.log("Creating the Abstract Syntax Tree");
            this.abstractSyntaxTree = concreteSyntaxTree.buildAST();
        };

        SemanticAnalyzer.scopeCheck = function () {
            Compiler.Logger.log("Performing Scope Checking");
            this.abstractSyntaxTree.buildSymbolTable(this.symbolTable);
        };

        SemanticAnalyzer.typeCheck = function () {
            Compiler.Logger.log("Performing Type Checking (Still testing)");
            this.abstractSyntaxTree.typeCheck(this.symbolTable);
        };

        SemanticAnalyzer.printWarnings = function () {
            this.symbolTable.printWarnings();
        };
        return SemanticAnalyzer;
    })();
    Compiler.SemanticAnalyzer = SemanticAnalyzer;
})(Compiler || (Compiler = {}));
