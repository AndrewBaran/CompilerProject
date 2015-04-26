module Compiler {

    // TODO: Do I need the symbol table?
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

            switch(root.getValue()) {

                // TODO: Probably don't need anything here
                case astNodeTypes.BLOCK:

                    Logger.logVerbose("Block node encountered: Going down to a new scope");
                    break;

                case astNodeTypes.VAR_DECLARATION:

                    this.varDeclarationTemplate(root);
                    break;

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

            var idNode: ASTNode = assignmentNode.getChildren()[0];
            var id: string = idNode.getValue();

            var idType: string = assignmentNode.getTypeInfo();

            if(idType === types.INT) {

                Logger.logVerbose("Inserting Integer Assignment (NOT IMPLEMENTED)");

                var rightChildNode: ASTNode = assignmentNode.getChildren()[1];

                if(rightChildNode.getNodeType() === treeNodeTypes.LEAF) {

                    var value: string = rightChildNode.getValue();

                    // Assigning a digit
                    if(rightChildNode.getTokenType() === TokenType[TokenType.T_DIGIT]) {

                        Logger.logVerbose("Inserting Integer Assignment of " + value + " to id " + id);

                        // Pad, as we can only have single digit literals
                        value = "0" + value;

                        // Load the accumulator with the value being stored
                        this.setCode("A9");
                        this.setCode(value);

                        var scopeLevel: number = idNode.getSymbolTableEntry().getScopeLevel();
                        var tempName: string = this.getEntryNameById(id, scopeLevel);

                        // Store the accumulator at the address of the id
                        this.setCode("8D");
                        this.setCode(tempName);
                        this.setCode("XX");
                    }

                    // Assigning an id
                    else if(rightChildNode.getTokenType() === TokenType[TokenType.T_ID]) {

                        Logger.logVerbose("Inserting Integer Assignment of id " + value + " to id " + id + " (NOT IMPLEMENTED)");
                    }
                }

                else {

                    // Assigning an addition expression
                    Logger.logVerbose("Inserting Integer Assignment of addition result to id " + id + " (NOT IMPLEMENTED)");
                }

            }

            else if(idType === types.BOOLEAN) {

                Logger.logVerbose("Inserting Boolean Assignment (NOT IMPLEMENTED)");

                var rightChildNode: ASTNode = assignmentNode.getChildren()[1];

                if(rightChildNode.getNodeType() === treeNodeTypes.LEAF) {

                    // Assigning true
                    if(rightChildNode.getTokenType() === TokenType[TokenType.T_TRUE]) {

                        Logger.logVerbose("Inserting Boolean Assignment of Literal True to id " + id);

                        // Load the accumulator with the value of 1 (for true)
                        this.setCode("A9");
                        this.setCode("01");

                        var scopeLevel: number = idNode.getSymbolTableEntry().getScopeLevel();
                        var tempName: string = this.getEntryNameById(id, scopeLevel);

                        // Store the value of 1 (true) at the address of the id
                        this.setCode("8D");
                        this.setCode(tempName);
                        this.setCode("XX");
                    }

                    // Assigning false
                    else if(rightChildNode.getTokenType() === TokenType[TokenType.T_FALSE]) {

                        Logger.logVerbose("Inserting Boolean Assignment of Literal False to id " + id);

                        // Load the accumulator with the value of 0 (for false)
                        this.setCode("A9");
                        this.setCode("00");

                        var scopeLevel: number = idNode.getSymbolTableEntry().getScopeLevel();
                        var tempName: string = this.getEntryNameById(id, scopeLevel);

                        // Store the value of 0 (false) at the address of the id
                        this.setCode("8D");
                        this.setCode(tempName);
                        this.setCode("XX");
                    }

                    // Assigning an id
                    else if(rightChildNode.getTokenType() === TokenType[TokenType.T_ID]) {

                        Logger.logVerbose("Inserting Boolean Assignment of id " + rightChildNode.getValue() + " to id " + id + " (NOT IMPLEMENTED)");
                    }
                }

                // Assigning a boolean expression
                else {
                    Logger.logVerbose("Inserting Boolean Assignment of Boolean Expression to id " + id + " (NOT IMPLEMENTED)");
                }

            }

            // String
            else {

                var id: string = assignmentNode.getChildren()[0].getValue();
                var value: string = assignmentNode.getChildren()[1].getValue();

                Logger.logVerbose("Inserting String Assignment of id " + id + " to string \"" + value + "\"");

                var startAddress: string = Utils.decimalToHex(this.addToHeap(value));

                var scopeLevel: number = assignmentNode.getChildren()[0].getSymbolTableEntry().getScopeLevel();
                var tempName: string = this.getEntryNameById(id, scopeLevel);

                // Load accumulator with the address of the string
                this.setCode("A9");
                this.setCode(startAddress);

                // Store the value of the accumulator at the address of the string variable
                this.setCode("8D");
                this.setCode(tempName);
                this.setCode("XX");
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

            else if(firstChildNode.getTokenType() === TokenType[TokenType.T_STRING_EXPRESSION]) {

                var valueToPrint: string = firstChildNode.getValue();

                Logger.logVerbose("Inserting Print Statement of Literal String \"" + valueToPrint + "\"");

                var hexAddress: string = Utils.decimalToHex(this.addToHeap(valueToPrint));

                // Load the Y register with the starting address of the string being printed
                this.setCode("A0");
                this.setCode(hexAddress);

                // Load 2 into X register to get ready to print a string
                this.setCode("A2");
                this.setCode("02");

                // System call
                this.setCode("FF");
            }

            else {

                Logger.log("This shouldn't happen. Should have covered all the print statement scenarios");
                throw "";
            }


        }

        // TODO: Add check to see if static space hits heap space
        private static setCode(input: string): void {

            if((this.currentIndex + 1) <= this.heapPointer) {

                this.codeList[this.currentIndex] = input;
                this.currentIndex++;
            }

            else {

                var errorMessage: string = "Error! Stack overflow at address " + Utils.decimalToHex(this.currentIndex + 1) + " when attempting to insert the code " + input;

                Logger.log(errorMessage);
                throw errorMessage;
            }

        }

        private static setCodeAtIndex(input: string, index: number): void {
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

                    this.setCodeAtIndex(hexLocation, cursorIndex);
                    this.setCodeAtIndex("00", cursorIndex + 1);
                }
            }
        }

        private static addToHeap(stringValue: string): number {

            Logger.logVerbose("Adding the string \"" + stringValue + "\" to the heap");

            // Add null terminator
            stringValue = stringValue + "\0";

            var stringLength: number = stringValue.length;
            var startHeapAddress: number = this.heapPointer - stringLength;

            // Check if heap clashes with static
            var endStaticSpace: number = this.currentIndex;

            if(startHeapAddress >= endStaticSpace) {

                Logger.logVerbose("Heap address " + startHeapAddress + " does not clash with static address " + endStaticSpace);

                for(var i: number = 0; i < stringLength; i++) {

                    var hexCode: string = Utils.decimalToHex(stringValue.charCodeAt(i));
                    this.setCodeAtIndex(hexCode, startHeapAddress + i);
                }

                this.heapPointer = startHeapAddress;
            }

            else {

                var errorMessage: string = "Error! Heap overflow occured when trying to add string \"" + stringValue + "\"";

                Logger.log(errorMessage);
                throw errorMessage;
            }

            return this.heapPointer;
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