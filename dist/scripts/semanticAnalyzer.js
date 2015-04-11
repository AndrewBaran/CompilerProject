var Compiler;
(function (Compiler) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer() {
        }
        SemanticAnalyzer.analyze = function (concreteSyntaxTree, symbolTable) {
            Compiler.Logger.log("Performing Semantic Analysis");
            Compiler.Logger.log("");

            this.setupAnalysisEnvironment();

            this.createAST(concreteSyntaxTree);
            this.scopeCheck();
            this.typeCheck();

            return this.abstractSyntaxTree;
        };

        SemanticAnalyzer.setupAnalysisEnvironment = function () {
            this.abstractSyntaxTree = new Compiler.AbstractSyntaxTree();
        };

        SemanticAnalyzer.createAST = function (concreteSyntaxTree) {
            Compiler.Logger.log("Creating the Abstract Syntax Tree");
            this.abstractSyntaxTree = concreteSyntaxTree.buildAST();
        };

        SemanticAnalyzer.scopeCheck = function () {
            Compiler.Logger.log("Performing Scope Checking (NOT IMPLEMENTED)");
        };

        SemanticAnalyzer.typeCheck = function () {
            Compiler.Logger.log("Performing Type Checking (NOT IMPLEMENTED)");
        };
        return SemanticAnalyzer;
    })();
    Compiler.SemanticAnalyzer = SemanticAnalyzer;
})(Compiler || (Compiler = {}));
