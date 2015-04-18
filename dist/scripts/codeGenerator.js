var Compiler;
(function (Compiler) {
    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.generateCode = function (abstractSyntaxTree, symbolTable) {
            Compiler.Logger.log("Generating 6502a Assembly Code (NOT IMPLEMENTED)");
            Compiler.Logger.log("");

            this.setupEnvironment(abstractSyntaxTree, symbolTable);

            Compiler.Logger.log("Code Generation Completed");

            return this.codeList;
        };

        CodeGenerator.setupEnvironment = function (abstractSyntaxTree, symbolTable) {
            this.abstractSyntaxTree = abstractSyntaxTree;
            this.symbolTable = symbolTable;

            this.codeList = [];

            for (var i = 0; i < _Constants.MAX_CODE_SIZE; i++) {
                this.codeList[i] = "00";
            }
        };
        return CodeGenerator;
    })();
    Compiler.CodeGenerator = CodeGenerator;
})(Compiler || (Compiler = {}));
