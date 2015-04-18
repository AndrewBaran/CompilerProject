module Compiler {

    export class CodeGenerator {

        private static abstractSyntaxTree: AbstractSyntaxTree;
        private static symbolTable: SymbolTable;

        private static codeList: string [];

        public static generateCode(abstractSyntaxTree: AbstractSyntaxTree, symbolTable: SymbolTable): string [] {

            Logger.log("Generating 6502a Assembly Code (NOT IMPLEMENTED)");
            Logger.log("");

            this.setupEnvironment(abstractSyntaxTree, symbolTable);

            Logger.log("Code Generation Completed");

            return this.codeList;
        }

        private static setupEnvironment(abstractSyntaxTree: AbstractSyntaxTree, symbolTable: SymbolTable): void {

            this.abstractSyntaxTree = abstractSyntaxTree;
            this.symbolTable = symbolTable;

            this.codeList = [];

            for(var i: number = 0; i < _Constants.MAX_CODE_SIZE; i++) {
                this.codeList[i] = "00";
            }
        }
    }
}