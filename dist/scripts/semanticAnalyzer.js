var Compiler;
(function (Compiler) {
    var SemanticAnalyzer = (function () {
        function SemanticAnalyzer() {
        }
        // TODO: Return AbstractSyntaxTree
        SemanticAnalyzer.analyze = function (concreteSyntaxTree, symbolTable) {
            Compiler.Logger.log("Performing Semantic Analysis");
            Compiler.Logger.log("");

            this.scopeCheck();
            this.typeCheck();
            this.createAST();
        };

        SemanticAnalyzer.scopeCheck = function () {
            Compiler.Logger.log("Performing Scope Checking");
        };

        SemanticAnalyzer.typeCheck = function () {
            Compiler.Logger.log("Performing Type Checking");
        };

        SemanticAnalyzer.createAST = function () {
            Compiler.Logger.log("Creating the Abstract Syntax Tree");
        };
        return SemanticAnalyzer;
    })();
    Compiler.SemanticAnalyzer = SemanticAnalyzer;
})(Compiler || (Compiler = {}));
