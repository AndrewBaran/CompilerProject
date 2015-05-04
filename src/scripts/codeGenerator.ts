module Compiler {

    // TODO: Do I need the symbol table? I don't think I do
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

        // TODO: Add while and if statements
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

                case astNodeTypes.IF_STATEMENT:

                    Logger.logVerbose("If statement (NOT IMPLEMENTED)");
                    break;

                case astNodeTypes.WHILE_STATEMENT:

                    Logger.logVerbose("While statement (NOT IMPLEMENTED)");
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

                var newEntry: TempTableEntry = this.insertNewTempEntry();
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;

                // Store accumulator at address of id (placeholder address for now)
                this.setCode("8D");
                this.setCode(newEntry.tempName);
                this.setCode("XX");
            }

            else {

                Logger.logVerbose("Inserting String Declaration of id " + idName);

                var newEntry: TempTableEntry = this.insertNewTempEntry();
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;

                // Load accumulator with 0, the null string
                this.setCode("A9");
                this.setCode("00");

                // Store the accumulator at the address of the string id
                this.setCode("8D");
                this.setCode(newEntry.tempName);
                this.setCode("XX");
            }

        }

        private static assignmentDeclarationTemplate(assignmentNode: ASTNode): void {

            var idNode: ASTNode = assignmentNode.getChildren()[0];
            var id: string = idNode.getValue();

            var idType: string = assignmentNode.getTypeInfo();

            if(idType === types.INT) {

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

                        Logger.logVerbose("Inserting Integer Assignment of id " + value + " to id " + id);

                        var rhsId: string = rightChildNode.getValue();
                        var rhsScopeLevel: number = rightChildNode.getSymbolTableEntry().getScopeLevel();
                        var rhsTempName: string = this.getEntryNameById(rhsId, rhsScopeLevel);

                        // Load the data at the address of the RHS id into the accumulator
                        this.setCode("AD");
                        this.setCode(rhsTempName);
                        this.setCode("XX");

                        var lhsScopeLevel: number = idNode.getSymbolTableEntry().getScopeLevel();
                        var lhsTempName: string = this.getEntryNameById(id, lhsScopeLevel);

                        // Store the data in the accumulator at the address of the LHS id
                        this.setCode("8D");
                        this.setCode(lhsTempName);
                        this.setCode("XX");
                    }
                }

                else {

                    Logger.logVerbose("Inserting Integer Assignment of addition result to id " + id);

                    var addressesToAdd: string[] = [];
                    addressesToAdd = this.insertAddLocations(rightChildNode, addressesToAdd);

                    var addressOfSum: string = this.insertAddCode(addressesToAdd);
                    var firstByte: string = addressOfSum.split(" ")[0];
                    var secondByte: string = addressOfSum.split(" ")[1];

                    // Load contents of the address of the sum to accumulator
                    this.setCode("AD");
                    this.setCode(firstByte);
                    this.setCode(secondByte);

                    var lhsScopeLevel: number = idNode.getSymbolTableEntry().getScopeLevel();
                    var tempName: string = this.getEntryNameById(id, lhsScopeLevel);

                    // Store contents of the accumulator (containing sum of addition) in address of LHS id
                    this.setCode("8D");
                    this.setCode(tempName);
                    this.setCode("XX");
                }

            }

            else if(idType === types.BOOLEAN) {

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

                        var rhsId: string = rightChildNode.getValue();
                        var rhsScopeLevel: number = rightChildNode.getSymbolTableEntry().getScopeLevel();
                        var rhsTempName: string = this.getEntryNameById(rhsId, rhsScopeLevel);

                        Logger.logVerbose("Inserting Boolean Assignment of id " + rhsId + " to id " + id);

                        // Load the data at the address of the RHS id into the accumulator
                        this.setCode("AD");
                        this.setCode(rhsTempName);
                        this.setCode("XX");

                        var lhsScopeLevel: number = idNode.getSymbolTableEntry().getScopeLevel();
                        var lhsTempName: string = this.getEntryNameById(id, lhsScopeLevel);

                        // Store the data in the accumulator at the address of the LHS id
                        this.setCode("8D");
                        this.setCode(lhsTempName);
                        this.setCode("XX");
                    }
                }

                // TODO: Assigning a boolean expression
                else {
                    Logger.logVerbose("Inserting Boolean Assignment of Boolean Expression to id " + id + " (NOT IMPLEMENTED)");
                }

            }

            // String
            else {

                var leftChildNode: ASTNode = assignmentNode.getChildren()[0];
                var rightChildNode: ASTNode = assignmentNode.getChildren()[1];

                // Assigning a string literal
                if(rightChildNode.getTokenType() === TokenType[TokenType.T_STRING_EXPRESSION]) {

                    var id: string = leftChildNode.getValue();
                    var value: string = rightChildNode.getValue();

                    Logger.logVerbose("Inserting String Assignment of id " + id + " to string \"" + value + "\"");

                    var startAddress: string = Utils.decimalToHex(this.addToHeap(value));

                    var scopeLevel: number = leftChildNode.getSymbolTableEntry().getScopeLevel();
                    var tempName: string = this.getEntryNameById(id, scopeLevel);

                    // Load accumulator with the address of the string
                    this.setCode("A9");
                    this.setCode(startAddress);

                    // Store the value of the accumulator at the address of the string variable
                    this.setCode("8D");
                    this.setCode(tempName);
                    this.setCode("XX");
                }

                // Assigning a string id
                else if(rightChildNode.getTokenType() === TokenType[TokenType.T_ID]) {

                    var lhsId: string = leftChildNode.getValue();
                    var lhsScopeLevel: number = leftChildNode.getSymbolTableEntry().getScopeLevel();
                    var lhsTempName: string = this.getEntryNameById(lhsId, lhsScopeLevel);

                    var rhsId: string = rightChildNode.getValue();
                    var rhsScopeLevel: number = rightChildNode.getSymbolTableEntry().getScopeLevel();
                    var rhsTempName: string = this.getEntryNameById(rhsId, rhsScopeLevel);

                    Logger.logVerbose("Inserting String Assignment of id " + rhsId + " to id " + lhsId);

                    // Load accumulator with the address of the rhs string
                    this.setCode("AD");
                    this.setCode(rhsTempName);
                    this.setCode("XX");

                    // Store value in accumulator as the address of the lhs string
                    this.setCode("8D");
                    this.setCode(lhsTempName);
                    this.setCode("XX");
                }
            }
        }

        private static printStatementTemplate(printNode: ASTNode): void {

            var firstChildNode: ASTNode = printNode.getChildren()[0];

            // Integer addition
            if(firstChildNode.getValue() === astNodeTypes.ADD) {

                Logger.logVerbose("Inserting Print Statement of Integer Addition");

                var addressesToAdd: string [] = [];
                addressesToAdd = this.insertAddLocations(firstChildNode, addressesToAdd);

                var addressOfSum: string = this.insertAddCode(addressesToAdd);
                var firstByte: string = addressOfSum.split(" ")[0];
                var secondByte: string = addressOfSum.split(" ")[1];

                // Load Y register with the number being printed
                this.setCode("AC");
                this.setCode(firstByte);
                this.setCode(secondByte);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            }

            // TODO: Boolean expression
            else if(firstChildNode.getValue() === astNodeTypes.EQUAL || firstChildNode.getValue() === astNodeTypes.NOT_EQUAL) {

                Logger.logVerbose("Inserting Print Statement of Boolean Expression (== or !=) (NOT IMPLEMENTED)");
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

        private static insertAddLocations(rootNode: ASTNode, addressesToAdd: string []): string [] {

            if(rootNode.getNodeType() === treeNodeTypes.LEAF) {

                if(rootNode.getTokenType() === TokenType[TokenType.T_ID]) {

                    // Get tempName of id
                    var id: string = rootNode.getValue();
                    var scopeLevel: number = rootNode.getSymbolTableEntry().getScopeLevel();
                    var tempName: string = this.getEntryNameById(id, scopeLevel);

                    Logger.logVerbose("Found id " + id + " to add");

                    var address: string = tempName + " " + "XX";

                    // Add address of tempName to list to be added together
                    addressesToAdd.push(address);
                }

                else if(rootNode.getTokenType() === TokenType[TokenType.T_DIGIT]) {

                    var intLiteral: string = "0" + rootNode.getValue();

                    // Load the accumulator with the int literal value
                    this.setCode("A9");
                    this.setCode(intLiteral);

                    // Create new temp table entry for the int literal (inefficient, but it works)
                    var newEntry: TempTableEntry = this.insertNewTempEntry();

                    // Store the accumulator at a new temp address
                    this.setCode("8D");
                    this.setCode(newEntry.tempName);
                    this.setCode("XX");

                    Logger.logVerbose("Found digit " + intLiteral + " to add");

                    var address: string = newEntry.tempName + " " + "XX";
                    addressesToAdd.push(address);
                }
            }


            for(var i: number = 0; i < rootNode.getChildren().length; i++) {
                addressesToAdd = this.insertAddLocations(rootNode.getChildren()[i], addressesToAdd);
            }

            return addressesToAdd;
        }

        // Insert the Add with Carry instructions into code; return address of location of sum
        private static insertAddCode(addLocations: string []): string {

            // Set accumulator to 0 so you can start adding
            this.setCode("A9");
            this.setCode("00");

            // Add them in reverse order they were added on to stack (precedence rules, even though its all addition)
            while(addLocations.length > 0) {

                var address: string = addLocations.pop();

                var firstByte: string = address.split(" ")[0];
                var secondByte: string = address.split(" ")[1];

                // Add contents of the address to the accumulator
                this.setCode("6D");
                this.setCode(firstByte);
                this.setCode(secondByte);
            }

            // Create new entry for the location of the sum
            var newEntry: TempTableEntry = this.insertNewTempEntry();

            // Store the accumulator, now holding the sum, at an address in memory and return that address
            this.setCode("8D");
            this.setCode(newEntry.tempName);
            this.setCode("XX");

            return newEntry.tempName + " " + "XX";
        }

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

                    if(parseInt(hexLocation, 16) < this.heapPointer) {

                        Logger.logVerbose("Resolving entry of " + currentCodeByte + " to: " + hexLocation);

                        tempTableEntry.resolvedAddress = hexLocation;

                        this.setCodeAtIndex(hexLocation, cursorIndex);
                        this.setCodeAtIndex("00", cursorIndex + 1);
                    }

                    else {

                        var errorMessage: string = "Error! Static space is clashing with heap space (beginning at " + Utils.decimalToHex(this.heapPointer) + ") when " + tempTableEntry.tempName + " was resolved to address " + hexLocation;

                        Logger.log(errorMessage);
                        throw errorMessage;
                    }

                }

                // TODO: Implement Jump patching
                // All jump locations start with J
                else if(/^J/.test(currentCodeByte)) {

                    Logger.logVerbose("Backpatching jump address for name: " + currentCodeByte + " (NOT IMPLEMENTED)");
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

        // Created new entry in table, and return entry
        private static insertNewTempEntry(): TempTableEntry {

            var tempName: string = "T" + this.tempTable.length.toString();
            var tempOffset: number = this.tempTable.length;

            var newEntry: TempTableEntry = new TempTableEntry();
            newEntry.tempName = tempName;
            newEntry.addressOffset = tempOffset;

            this.tempTable.push(newEntry);

            return newEntry;
        }

        // TODO: Delete after testing
        private static debugPrintTempTable(): void {

            if(this.tempTable.length > 0) {

                Logger.log("");
                Logger.log("Temp Table");
                Logger.log("--------------------------------");

                for(var i: number = 0; i < this.tempTable.length; i++) {

                    var entry: TempTableEntry = this.tempTable[i];

                    Logger.log(entry.tempName + " | " + entry.idName + " | " + entry.addressOffset + " | " + entry.resolvedAddress + " | " + entry.scopeLevel);
                }
            }
        }

        private static getEntryNameById(idName: string, scopeLevel: number): string {

            var currentEntry: TempTableEntry = null;
            var entryFound: boolean = false;

            for(var i: number = this.tempTable.length - 1; i >= 0 && !entryFound; i--) {

                currentEntry = this.tempTable[i];

                if(currentEntry.idName === idName && currentEntry.scopeLevel === scopeLevel) {

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