module Compiler {

    export class CodeGenerator {

        private static abstractSyntaxTree: AbstractSyntaxTree;
        private static symbolTable: SymbolTable;

        private static codeList: string [];
        private static currentIndex: number;

        private static tempTable: TempTableEntry [];

        public static generateCode(abstractSyntaxTree: AbstractSyntaxTree, symbolTable: SymbolTable): string [] {

            Logger.log("Generating 6502a Assembly Code (NOT IMPLEMENTED)");
            Logger.log("");

            this.setupEnvironment(abstractSyntaxTree, symbolTable);
            this.buildCode(abstractSyntaxTree.getRoot());

            Logger.logVerbose("");
            Logger.log("Code Generation Completed");

            // TODO: Delete after testing
            this.debugPrintTempTable();

            return this.codeList;
        }

        private static setupEnvironment(abstractSyntaxTree: AbstractSyntaxTree, symbolTable: SymbolTable): void {

            this.abstractSyntaxTree = abstractSyntaxTree;
            this.symbolTable = symbolTable;

            this.codeList = [];

            for(var i: number = 0; i < _Constants.MAX_CODE_SIZE; i++) {
                this.codeList[i] = "00";
            }

            this.currentIndex = 0;

            this.tempTable = [];
        }

        private static buildCode(root: ASTNode): void {

            Logger.log("Node: " + root.getValue());

            switch(root.getValue()) {

                case astNodeTypes.BLOCK:

                    Logger.log("Block node");
                    break;

                case astNodeTypes.VAR_DECLARATION:

                    Logger.log("Variable declaration");

                    var type: string = root.getChildren()[0].getTypeInfo();
                    var idName: string = root.getChildren()[1].getValue();

                    Logger.log(type + " " + idName);

                    this.varDeclarationTemplate(type, idName);

                    break;

                case astNodeTypes.ASSIGNMENT_STATEMENT:

                    Logger.log("Assignment statement");

                    var idName: string = root.getChildren()[0].getValue();
                    var type: string = root.getChildren()[0].getSymbolTableEntry().getIdType();

                    // TODO: Doesn't work for 1 + 2 + 3 + a + ... cases
                    var value: string = root.getChildren()[1].getValue();

                    this.assignmentDeclarationTemplate(idName, type, value);

                    break;

                case astNodeTypes.PRINT_STATEMENT:

                    Logger.log("Print statement");
                    break;

                default:

                    break;
            }

            for(var i: number = 0; i < root.getChildren().length; i++) {

                this.buildCode(root.getChildren()[i]);
            }
        }

        private static varDeclarationTemplate(type: string, idName: string): void {

            Logger.log("Template for variable declaration");

            if(type === types.INT || type === types.BOOLEAN) {

                // Load accumulator with 0
                this.setCode("A9");
                this.setCode("00");

                var tempName: string = "T" + this.tempTable.length.toString();
                var tempOffset: number = this.tempTable.length;

                var newEntry: TempTableEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.addressOffset = tempOffset;

                this.tempTable.push(newEntry);

                // Store accumulator at address of id (placeholder address for now)
                this.setCode("8D");
                this.setCode(tempName);
                this.setCode("XX");
            }

            // TODO: String case
            else {
                Logger.log("String declaration (NOT IMPLEMENTED)");
            }

        }

        private static assignmentDeclarationTemplate(idName: string, idType: string, value: string) {

            if(idType === types.INT) {

                Logger.log("Assignment of int");

            }

            else if(idType === types.BOOLEAN) {

                // TODO: Convert value to 0 (false) or 1 (true) or use string rep of true / false
            }

            // String
            else {
                Logger.log("String assignment (NOT IMPLEMENTED)");
            }
        }


        private static setCode(input: string): void {

            this.codeList[this.currentIndex] = input;
            this.currentIndex++;
        }

        // TODO: Delete after testing
        private static debugPrintTempTable(): void {

            if(this.tempTable.length > 0) {

                Logger.log("Temp Table");
                Logger.log("----------------");

                for(var i: number = 0; i < this.tempTable.length; i++) {

                    var entry: TempTableEntry = this.tempTable[i];

                    Logger.log(entry.tempName + " | " + entry.idName + " | +" + entry.addressOffset);
                }
            }
        }

    }


    class TempTableEntry {

        public tempName: string;
        public idName: string;
        public addressOffset: number;

        constructor() {

        }
    }
}