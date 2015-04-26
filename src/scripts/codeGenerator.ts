module Compiler {

    export class CodeGenerator {

        private static abstractSyntaxTree: AbstractSyntaxTree;
        private static symbolTable: SymbolTable;

        private static codeList: string [];
        private static currentIndex: number;

        private static tempTable: TempTableEntry [];

        private static heapPointer: number;

        public static generateCode(abstractSyntaxTree: AbstractSyntaxTree, symbolTable: SymbolTable): string [] {

            Logger.log("Generating 6502a Assembly Code (NOT FINISHED)");
            Logger.log("");

            this.setupEnvironment(abstractSyntaxTree, symbolTable);

            this.buildCode(abstractSyntaxTree.getRoot());

            Logger.logVerbose("Inserting Break Statement");
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

            this.heapPointer = _Constants.MAX_CODE_SIZE;
        }

        private static buildCode(root: ASTNode): void {

            Logger.log("Node: " + root.getValue());

            switch(root.getValue()) {

                // TODO: Actually go down a scope level
                case astNodeTypes.BLOCK:

                    Logger.logVerbose("Block node encountered: Going down to a new scope");
                    break;

                case astNodeTypes.VAR_DECLARATION:

                    this.varDeclarationTemplate(root);
                    break;

                // TODO: Make it so I pass AST node
                case astNodeTypes.ASSIGNMENT_STATEMENT:

                    this.assignmentDeclarationTemplate(root);

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

        private static varDeclarationTemplate(declarationNode: ASTNode): void {

            var type: string = declarationNode.getChildren()[0].getValue();
            var idName: string = declarationNode.getChildren()[1].getValue();
            var scopeLevel: number = declarationNode.getChildren()[1].getSymbolTableEntry().getScopeLevel();

            if(type === types.INT || type === types.BOOLEAN) {

                Logger.logVerbose("Inserting Int / Boolean Declaration of id " + idName);

                // Load accumulator with 0
                this.setCode("A9");
                this.setCode("00");

                var tempName: string = "T" + this.tempTable.length.toString();
                var tempOffset: number = this.tempTable.length;

                var newEntry: TempTableEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;
                newEntry.addressOffset = tempOffset;

                this.tempTable.push(newEntry);

                // Store accumulator at address of id (placeholder address for now)
                this.setCode("8D");
                this.setCode(tempName);
                this.setCode("XX");
            }

            else {

                Logger.logVerbose("Inserting String Declaration of id " + idName);

                var tempName: string = "T" + this.tempTable.length.toString();
                var tempOffset: number = this.tempTable.length;

                var newEntry: TempTableEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;
                newEntry.addressOffset = tempOffset;

                this.tempTable.push(newEntry);
            }

        }

        private static assignmentDeclarationTemplate(assignmentNode: ASTNode): void {

            var idType: string = assignmentNode.getTypeInfo();

            if(idType === types.INT) {

                Logger.logVerbose("Inserting Integer Assignment (NOT IMPLEMENTED)");
            }

            else if(idType === types.BOOLEAN) {

                // TODO: Convert value to 0 (false) or 1 (true)
                Logger.logVerbose("Inserting Boolean Assignment (NOT IMPLEMENTED)");
            }

            // String
            else {

                Logger.logVerbose("Inserting String Assignment (NOT IMPLEMENTED)");
                var value: string = assignmentNode.getChildren()[1].getValue();

                var startAddress: number = this.addToHeap(value);
            }
        }

        private static printStatementTemplate(printNode: ASTNode): void {

            var firstChildNode: ASTNode = printNode.getChildren()[0];

            // TODO: Compound expression (addition or comparisons involved)
            if(firstChildNode.getNodeType() === treeNodeTypes.INTERIOR) {

                Logger.logVerbose("Printing found interior node, so doing addition (NOT IMPLEMENTED)");
            }

            // Single digit
            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_DIGIT]) {

                Logger.logVerbose("Inserting Print Statement of Integer Literal");

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

                Logger.logVerbose("Inserting Print Statement of id with type " + firstChildNode.getSymbolTableEntry().getIdType());

                var id: string = firstChildNode.getValue();
                var scopeLevel: number = firstChildNode.getSymbolTableEntry().getScopeLevel();
                var tempName: string = this.getEntryNameById(id, scopeLevel);

                // Load the Y register from the memory address of the id
                this.setCode("AC");
                this.setCode(tempName);
                this.setCode("XX");

                var type: string = firstChildNode.getTypeInfo();

                // Load 1 into X register to get ready to print an int / boolean
                if(type === types.INT || type === types.BOOLEAN) {

                    this.setCode("A2");
                    this.setCode("01");
                }

                // Load 2 into X register to get ready to print a string
                else {

                    this.setCode("A2");
                    this.setCode("02");
                }

                // System call
                this.setCode("FF");
            }

            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_TRUE]){

                Logger.logVerbose("Inserting Print Statement of Literal True");

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

                Logger.logVerbose("Inserting Print Statement of Literal False");

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

            Logger.logVerbose("Backpatching the code and resolving addresses");

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

                    Logger.logVerbose("New index for entry " + currentCodeByte + " is: " + hexLocation);

                    tempTableEntry.resolvedAddress = hexLocation;

                    this.setCodeAtIndex(cursorIndex, hexLocation);
                    this.setCodeAtIndex(cursorIndex + 1, "00");

                }
            }
        }

        private static addToHeap(stringValue: string): number {

            Logger.logVerbose("Adding the string \"" + stringValue + "\" to the heap");

            // Include null terminator
            var stringLength: number = stringValue.length + 1;
            var startAddress: number = this.heapPointer - stringLength;

            Logger.log("Starting address for string " + stringValue + " is " + startAddress);

            // Check if heap clashes with static

            return 255;
        }

        // TODO: Delete after testing
        private static debugPrintTempTable(): void {

            if(this.tempTable.length > 0) {

                Logger.log("");
                Logger.log("Temp Table");
                Logger.log("--------------------------------");
                Logger.log("Name | Id | Offset | Resolved | Scope");

                for(var i: number = 0; i < this.tempTable.length; i++) {

                    var entry: TempTableEntry = this.tempTable[i];

                    Logger.log(entry.tempName + " | " + entry.idName + " | " + entry.addressOffset + " | " + entry.resolvedAddress + " | " + entry.scopeLevel);
                }
            }
        }

        private static getEntryNameById(idName: string, scopeLevel: number): string {

            Logger.logVerbose("Looking for id " + idName + " in scope " + scopeLevel);

            var currentEntry: TempTableEntry = null;
            var entryFound: boolean = false;

            for(var i: number = this.tempTable.length - 1; i >= 0 && !entryFound; i--) {

                currentEntry = this.tempTable[i];

                if(currentEntry.idName === idName && currentEntry.scopeLevel === scopeLevel) {

                    Logger.logVerbose("Id " + idName + " in scope " + scopeLevel + " was found");

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
        public scopeLevel: number;
        public addressOffset: number;
        public resolvedAddress: string;

        constructor() {

            this.tempName = "";
            this.idName = "";
            this.scopeLevel = -1;
            this.addressOffset = -1;
            this.resolvedAddress = "";

        }
    }
}