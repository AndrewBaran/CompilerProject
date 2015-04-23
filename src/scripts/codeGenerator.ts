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
            this.setCode("00"); // Program break

            this.backPatchCode();

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

                    this.printStatementTemplate(root);
                    break;

                default:

                    break;
            }

            for(var i: number = 0; i < root.getChildren().length; i++) {
                this.buildCode(root.getChildren()[i]);
            }
        }

        // TODO: Case where string declared, then int/bool causes int/bool to skip a space in static space
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

            // TODO: Not right?
            else {

                // TODO: Remove after testing
                Logger.log("String declaration");

                var tempName: string = "T" + this.tempTable.length.toString();

                var newEntry: TempTableEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.addressOffset = -1;

                this.tempTable.push(newEntry);
            }

        }

        private static assignmentDeclarationTemplate(idName: string, idType: string, value: string) {

            if(idType === types.INT) {

                Logger.log("Int assignment (NOT IMPLEMENTED)");
            }

            else if(idType === types.BOOLEAN) {

                // TODO: Convert value to 0 (false) or 1 (true)
                Logger.log("Bool assignment (NOT IMPLEMENTED)");
            }

            // String
            else {
                Logger.log("String assignment (NOT IMPLEMENTED)");
            }
        }

        private static printStatementTemplate(printNode: ASTNode): void {

            var firstChildNode: ASTNode = printNode.getChildren()[0];

            // TODO: Compound expression (addition or comparisons involved)
            if(firstChildNode.getNodeType() === treeNodeTypes.INTERIOR) {

                Logger.log("Printing found interior node, so doing addition (NOT IMPLEMENTED)");
            }

            // Single digit
            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_DIGIT]) {

                // Pad digit with 0 (digits range from 0-9 only)
                var digitToPrint: string = "0" + firstChildNode.getValue();

                // Load the Y register with the digit being printed
                this.setCode("A0");
                this.setCode(digitToPrint);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            }

            // Single ID
            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_ID]) {

                var id: string = firstChildNode.getValue();
                var tempName: string = this.getEntryNameById(id);

                // Load the Y register from the memory address of the id
                this.setCode("AC");
                this.setCode(tempName);
                this.setCode("XX");

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            }

            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_TRUE]){

                // True is equivalent to 1
                var digitToPrint: string = "01";

                // Load the Y register with the digit being printed
                this.setCode("A0");
                this.setCode(digitToPrint);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            }

            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_FALSE]) {

                // False is equivalent to 0
                var digitToPrint: string = "00";

                // Load the Y register with the digit being printed
                this.setCode("A0");
                this.setCode(digitToPrint);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            }

            // TODO: Add string case
            else {

            }


        }


        private static setCode(input: string): void {

            this.codeList[this.currentIndex] = input;
            this.currentIndex++;
        }

        private static setCodeAtIndex(index: number, input: string): void {
            this.codeList[index] = input;
        }

        private static backPatchCode(): void {

            // currentIndex should point to beginning of static code
            var currentCodeByte: string = "";
            var staticAreaStart: number = this.currentIndex;

            for(var cursorIndex: number = 0; cursorIndex < staticAreaStart; cursorIndex++) {

                currentCodeByte = this.codeList[cursorIndex];

                // All temp variables start with T
                if(/^T/.test(currentCodeByte)) {

                    var substringIndex: number = parseInt(currentCodeByte.substring(1), 10);
                    var tempTableEntry: TempTableEntry = this.tempTable[substringIndex];

                    var newIndex: number = staticAreaStart + tempTableEntry.addressOffset;
                    var hexLocation: string = Utils.decimalToHex(newIndex);

                    // TODO: Remove after testing (or make verbose only)
                    Logger.log("New index for entry " + currentCodeByte + " is: " + hexLocation);
                    tempTableEntry.resolvedAddress = hexLocation;

                    this.setCodeAtIndex(cursorIndex, hexLocation);
                    this.setCodeAtIndex(cursorIndex + 1, "00");

                }
            }
        }

        // TODO: Delete after testing
        private static debugPrintTempTable(): void {

            if(this.tempTable.length > 0) {

                Logger.log("");
                Logger.log("Temp Table");
                Logger.log("--------------------------------");

                for(var i: number = 0; i < this.tempTable.length; i++) {

                    var entry: TempTableEntry = this.tempTable[i];

                    Logger.log(entry.tempName + " | " + entry.idName + " | " + entry.addressOffset + " | " + entry.resolvedAddress);
                }
            }
        }

        private static getEntryNameById(idName: string): string {

            var currentEntry: TempTableEntry = null;
            var entryFound: boolean = false;

            // TODO: Search backwards for most recent declaration?
            for(var i: number = this.tempTable.length - 1; i >= 0 && !entryFound; i--) {

                currentEntry = this.tempTable[i];

                if(currentEntry.idName === idName) {

                    entryFound = true;
                    break;
                }
            }

            if(entryFound) {
                return currentEntry.tempName;
            }

            else {

                var errorMessage: string = "Error! Id " + idName + " was not found in the temp table";

                Logger.log(errorMessage);
                throw errorMessage;
            }
        }

    }


    // TODO: Remove resolvedAddress after testing
    class TempTableEntry {

        public tempName: string;
        public idName: string;
        public addressOffset: number;
        public resolvedAddress: string;

        constructor() {

            this.tempName = "";
            this.idName = "";
            this.addressOffset = -1;
            this.resolvedAddress = "";

        }
    }
}