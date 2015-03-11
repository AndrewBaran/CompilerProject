var Compiler;
(function (Compiler) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer() {
        }
        SemanticAnalyzer.analyze = function (concreteSyntaxTree, symbolTable) {
            Compiler.Logger.log("Performing Semantic Analysis");
            Compiler.Logger.log("");

            this.setupAnalysisEnvironment();

            this.createAST();
            this.scopeCheck();
            this.typeCheck();

            return this.abstractSyntaxTree;
        };

        SemanticAnalyzer.setupAnalysisEnvironment = function () {
            this.abstractSyntaxTree = new Compiler.AbstractSyntaxTree();
        };

        SemanticAnalyzer.createAST = function () {
            Compiler.Logger.log("Creating the Abstract Syntax Tree");
        };

        SemanticAnalyzer.scopeCheck = function () {
            Compiler.Logger.log("Performing Scope Checking");
        };

        SemanticAnalyzer.typeCheck = function () {
            Compiler.Logger.log("Performing Type Checking");
        };
        return SemanticAnalyzer;
    })();
    Compiler.SemanticAnalyzer = SemanticAnalyzer;
})(Compiler || (Compiler = {}));
