var Compiler;
(function (Compiler) {
    // TODO: Do I need the symbol table?
    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.generateCode = function (abstractSyntaxTree, symbolTable) {
            Compiler.Logger.log("Generating 6502a Assembly Code (NOT FINISHED)");
            Compiler.Logger.log("");

            this.setupEnvironment(abstractSyntaxTree, symbolTable);

            this.buildCode(abstractSyntaxTree.getRoot());

            Compiler.Logger.logVerbose("Inserting Break Statement");
            this.setCode("00"); // Program break

            this.backPatchCode();

            Compiler.Logger.logVerbose("");
            Compiler.Logger.log("Code Generation Completed");

            // TODO: Delete after testing
            this.debugPrintTempTable();

            return this.codeList;
        };

        CodeGenerator.setupEnvironment = function (abstractSyntaxTree, symbolTable) {
            this.abstractSyntaxTree = abstractSyntaxTree;
            this.symbolTable = symbolTable;

            this.codeList = [];

            for (var i = 0; i < _Constants.MAX_CODE_SIZE; i++) {
                this.codeList[i] = "00";
            }

            this.currentIndex = 0;

            this.tempTable = [];

            this.heapPointer = _Constants.MAX_CODE_SIZE;
        };

        CodeGenerator.buildCode = function (root) {
            switch (root.getValue()) {
                case astNodeTypes.BLOCK:
                    Compiler.Logger.logVerbose("Block node encountered: Going down to a new scope");
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

            for (var i = 0; i < root.getChildren().length; i++) {
                this.buildCode(root.getChildren()[i]);
            }
        };

        CodeGenerator.varDeclarationTemplate = function (declarationNode) {
            var type = declarationNode.getChildren()[0].getValue();
            var idName = declarationNode.getChildren()[1].getValue();
            var scopeLevel = declarationNode.getChildren()[1].getSymbolTableEntry().getScopeLevel();

            if (type === types.INT || type === types.BOOLEAN) {
                Compiler.Logger.logVerbose("Inserting Int / Boolean Declaration of id " + idName);

                // Load accumulator with 0
                this.setCode("A9");
                this.setCode("00");

                var tempName = "T" + this.tempTable.length.toString();
                var tempOffset = this.tempTable.length;

                var newEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;
                newEntry.addressOffset = tempOffset;

                this.tempTable.push(newEntry);

                // Store accumulator at address of id (placeholder address for now)
                this.setCode("8D");
                this.setCode(tempName);
                this.setCode("XX");
            } else {
                Compiler.Logger.logVerbose("Inserting String Declaration of id " + idName);

                var tempName = "T" + this.tempTable.length.toString();
                var tempOffset = this.tempTable.length;

                var newEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;
                newEntry.addressOffset = tempOffset;

                this.tempTable.push(newEntry);
            }
        };

        CodeGenerator.assignmentDeclarationTemplate = function (assignmentNode) {
            var idNode = assignmentNode.getChildren()[0];
            var id = idNode.getValue();

            var idType = assignmentNode.getTypeInfo();

            if (idType === types.INT) {
                Compiler.Logger.logVerbose("Inserting Integer Assignment (NOT IMPLEMENTED)");

                var rightChildNode = assignmentNode.getChildren()[1];

                if (rightChildNode.getNodeType() === treeNodeTypes.LEAF) {
                    var value = rightChildNode.getValue();

                    // Assigning a digit
                    if (rightChildNode.getTokenType() === TokenType[11 /* T_DIGIT */]) {
                        Compiler.Logger.logVerbose("Inserting Integer Assignment of " + value + " to id " + id);

                        // Pad, as we can only have single digit literals
                        value = "0" + value;

                        // Load the accumulator with the value being stored
                        this.setCode("A9");
                        this.setCode(value);

                        var scopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                        var tempName = this.getEntryNameById(id, scopeLevel);

                        // Store the accumulator at the address of the id
                        this.setCode("8D");
                        this.setCode(tempName);
                        this.setCode("XX");
                    } else if (rightChildNode.getTokenType() === TokenType[12 /* T_ID */]) {
                        Compiler.Logger.logVerbose("Inserting Integer Assignment of id " + value + " to id " + id);

                        var rhsId = rightChildNode.getValue();
                        var rhsScopeLevel = rightChildNode.getSymbolTableEntry().getScopeLevel();
                        var rhsTempName = this.getEntryNameById(rhsId, rhsScopeLevel);

                        // Load the data at the address of the RHS id into the accumulator
                        this.setCode("AD");
                        this.setCode(rhsTempName);
                        this.setCode("XX");

                        var lhsScopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                        var lhsTempName = this.getEntryNameById(id, lhsScopeLevel);

                        // Store the data in the accumulator at the address of the LHS id
                        this.setCode("8D");
                        this.setCode(lhsTempName);
                        this.setCode("XX");
                    }
                } else {
                    // Assigning an addition expression
                    Compiler.Logger.logVerbose("Inserting Integer Assignment of addition result to id " + id + " (NOT IMPLEMENTED)");
                }
            } else if (idType === types.BOOLEAN) {
                Compiler.Logger.logVerbose("Inserting Boolean Assignment (NOT IMPLEMENTED)");

                var rightChildNode = assignmentNode.getChildren()[1];

                if (rightChildNode.getNodeType() === treeNodeTypes.LEAF) {
                    // Assigning true
                    if (rightChildNode.getTokenType() === TokenType[25 /* T_TRUE */]) {
                        Compiler.Logger.logVerbose("Inserting Boolean Assignment of Literal True to id " + id);

                        // Load the accumulator with the value of 1 (for true)
                        this.setCode("A9");
                        this.setCode("01");

                        var scopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                        var tempName = this.getEntryNameById(id, scopeLevel);

                        // Store the value of 1 (true) at the address of the id
                        this.setCode("8D");
                        this.setCode(tempName);
                        this.setCode("XX");
                    } else if (rightChildNode.getTokenType() === TokenType[24 /* T_FALSE */]) {
                        Compiler.Logger.logVerbose("Inserting Boolean Assignment of Literal False to id " + id);

                        // Load the accumulator with the value of 0 (for false)
                        this.setCode("A9");
                        this.setCode("00");

                        var scopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                        var tempName = this.getEntryNameById(id, scopeLevel);

                        // Store the value of 0 (false) at the address of the id
                        this.setCode("8D");
                        this.setCode(tempName);
                        this.setCode("XX");
                    } else if (rightChildNode.getTokenType() === TokenType[12 /* T_ID */]) {
                        var rhsId = rightChildNode.getValue();
                        var rhsScopeLevel = rightChildNode.getSymbolTableEntry().getScopeLevel();
                        var rhsTempName = this.getEntryNameById(rhsId, rhsScopeLevel);

                        Compiler.Logger.logVerbose("Inserting Boolean Assignment of id " + rhsId + " to id " + id);

                        // Load the data at the address of the RHS id into the accumulator
                        this.setCode("AD");
                        this.setCode(rhsTempName);
                        this.setCode("XX");

                        var lhsScopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                        var lhsTempName = this.getEntryNameById(id, lhsScopeLevel);

                        // Store the data in the accumulator at the address of the LHS id
                        this.setCode("8D");
                        this.setCode(lhsTempName);
                        this.setCode("XX");
                    }
                } else {
                    Compiler.Logger.logVerbose("Inserting Boolean Assignment of Boolean Expression to id " + id + " (NOT IMPLEMENTED)");
                }
            } else {
                var id = assignmentNode.getChildren()[0].getValue();
                var value = assignmentNode.getChildren()[1].getValue();

                Compiler.Logger.logVerbose("Inserting String Assignment of id " + id + " to string \"" + value + "\"");

                var startAddress = Compiler.Utils.decimalToHex(this.addToHeap(value));

                var scopeLevel = assignmentNode.getChildren()[0].getSymbolTableEntry().getScopeLevel();
                var tempName = this.getEntryNameById(id, scopeLevel);

                // Load accumulator with the address of the string
                this.setCode("A9");
                this.setCode(startAddress);

                // Store the value of the accumulator at the address of the string variable
                this.setCode("8D");
                this.setCode(tempName);
                this.setCode("XX");
            }
        };

        CodeGenerator.printStatementTemplate = function (printNode) {
            var firstChildNode = printNode.getChildren()[0];

            // TODO: Compound expression (addition or comparisons involved)
            if (firstChildNode.getNodeType() === treeNodeTypes.INTERIOR) {
                Compiler.Logger.logVerbose("Printing found interior node, so doing addition (NOT IMPLEMENTED)");
            } else if (firstChildNode.getTokenType() === TokenType[11 /* T_DIGIT */]) {
                Compiler.Logger.logVerbose("Inserting Print Statement of Integer Literal");

                // Pad digit with 0 (digits range from 0-9 only)
                var digitToPrint = "0" + firstChildNode.getValue();

                // Load the Y register with the digit being printed
                this.setCode("A0");
                this.setCode(digitToPrint);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            } else if (firstChildNode.getTokenType() === TokenType[12 /* T_ID */]) {
                Compiler.Logger.logVerbose("Inserting Print Statement of id with type " + firstChildNode.getSymbolTableEntry().getIdType());

                var id = firstChildNode.getValue();
                var scopeLevel = firstChildNode.getSymbolTableEntry().getScopeLevel();
                var tempName = this.getEntryNameById(id, scopeLevel);

                // Load the Y register from the memory address of the id
                this.setCode("AC");
                this.setCode(tempName);
                this.setCode("XX");

                var type = firstChildNode.getTypeInfo();

                // Load 1 into X register to get ready to print an int / boolean
                if (type === types.INT || type === types.BOOLEAN) {
                    this.setCode("A2");
                    this.setCode("01");
                } else {
                    this.setCode("A2");
                    this.setCode("02");
                }

                // System call
                this.setCode("FF");
            } else if (firstChildNode.getTokenType() === TokenType[25 /* T_TRUE */]) {
                Compiler.Logger.logVerbose("Inserting Print Statement of Literal True");

                // True is equivalent to 1
                var digitToPrint = "01";

                // Load the Y register with the digit being printed
                this.setCode("A0");
                this.setCode(digitToPrint);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            } else if (firstChildNode.getTokenType() === TokenType[24 /* T_FALSE */]) {
                Compiler.Logger.logVerbose("Inserting Print Statement of Literal False");

                // False is equivalent to 0
                var digitToPrint = "00";

                // Load the Y register with the digit being printed
                this.setCode("A0");
                this.setCode(digitToPrint);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            } else if (firstChildNode.getTokenType() === TokenType[27 /* T_STRING_EXPRESSION */]) {
                var valueToPrint = firstChildNode.getValue();

                Compiler.Logger.logVerbose("Inserting Print Statement of Literal String \"" + valueToPrint + "\"");

                var hexAddress = Compiler.Utils.decimalToHex(this.addToHeap(valueToPrint));

                // Load the Y register with the starting address of the string being printed
                this.setCode("A0");
                this.setCode(hexAddress);

                // Load 2 into X register to get ready to print a string
                this.setCode("A2");
                this.setCode("02");

                // System call
                this.setCode("FF");
            } else {
                Compiler.Logger.log("This shouldn't happen. Should have covered all the print statement scenarios");
                throw "";
            }
        };

        // TODO: Add check to see if static space hits heap space
        CodeGenerator.setCode = function (input) {
            if ((this.currentIndex + 1) <= this.heapPointer) {
                this.codeList[this.currentIndex] = input;
                this.currentIndex++;
            } else {
                var errorMessage = "Error! Stack overflow at address " + Compiler.Utils.decimalToHex(this.currentIndex + 1) + " when attempting to insert the code " + input;

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        CodeGenerator.setCodeAtIndex = function (input, index) {
            this.codeList[index] = input;
        };

        CodeGenerator.backPatchCode = function () {
            Compiler.Logger.logVerbose("Backpatching the code and resolving addresses");

            // currentIndex should point to beginning of static code
            var currentCodeByte = "";
            var staticAreaStart = this.currentIndex;

            for (var cursorIndex = 0; cursorIndex < staticAreaStart; cursorIndex++) {
                currentCodeByte = this.codeList[cursorIndex];

                // All temp variables start with T
                if (/^T/.test(currentCodeByte)) {
                    var substringIndex = parseInt(currentCodeByte.substring(1), 10);
                    var tempTableEntry = this.tempTable[substringIndex];

                    var newIndex = staticAreaStart + tempTableEntry.addressOffset;
                    var hexLocation = Compiler.Utils.decimalToHex(newIndex);

                    Compiler.Logger.logVerbose("New index for entry " + currentCodeByte + " is: " + hexLocation);

                    tempTableEntry.resolvedAddress = hexLocation;

                    this.setCodeAtIndex(hexLocation, cursorIndex);
                    this.setCodeAtIndex("00", cursorIndex + 1);
                }
            }
        };

        CodeGenerator.addToHeap = function (stringValue) {
            Compiler.Logger.logVerbose("Adding the string \"" + stringValue + "\" to the heap");

            // Add null terminator
            stringValue = stringValue + "\0";

            var stringLength = stringValue.length;
            var startHeapAddress = this.heapPointer - stringLength;

            // Check if heap clashes with static
            var endStaticSpace = this.currentIndex;

            if (startHeapAddress >= endStaticSpace) {
                Compiler.Logger.logVerbose("Heap address " + startHeapAddress + " does not clash with static address " + endStaticSpace);

                for (var i = 0; i < stringLength; i++) {
                    var hexCode = Compiler.Utils.decimalToHex(stringValue.charCodeAt(i));
                    this.setCodeAtIndex(hexCode, startHeapAddress + i);
                }

                this.heapPointer = startHeapAddress;
            } else {
                var errorMessage = "Error! Heap overflow occured when trying to add string \"" + stringValue + "\"";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }

            return this.heapPointer;
        };

        // TODO: Delete after testing
        CodeGenerator.debugPrintTempTable = function () {
            if (this.tempTable.length > 0) {
                Compiler.Logger.log("");
                Compiler.Logger.log("Temp Table");
                Compiler.Logger.log("--------------------------------");
                Compiler.Logger.log("Name | Id | Offset | Resolved | Scope");

                for (var i = 0; i < this.tempTable.length; i++) {
                    var entry = this.tempTable[i];

                    Compiler.Logger.log(entry.tempName + " | " + entry.idName + " | " + entry.addressOffset + " | " + entry.resolvedAddress + " | " + entry.scopeLevel);
                }
            }
        };

        CodeGenerator.getEntryNameById = function (idName, scopeLevel) {
            Compiler.Logger.logVerbose("Looking for id " + idName + " in scope " + scopeLevel);

            var currentEntry = null;
            var entryFound = false;

            for (var i = this.tempTable.length - 1; i >= 0 && !entryFound; i--) {
                currentEntry = this.tempTable[i];

                if (currentEntry.idName === idName && currentEntry.scopeLevel === scopeLevel) {
                    Compiler.Logger.logVerbose("Id " + idName + " in scope " + scopeLevel + " was found");

                    entryFound = true;
                    break;
                }
            }

            if (entryFound) {
                return currentEntry.tempName;
            } else {
                var errorMessage = "Error! Id " + idName + " was not found in the temp table";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };
        return CodeGenerator;
    })();
    Compiler.CodeGenerator = CodeGenerator;

    // TODO: Remove resolvedAddress after testing
    var TempTableEntry = (function () {
        function TempTableEntry() {
            this.tempName = "";
            this.idName = "";
            this.scopeLevel = -1;
            this.addressOffset = -1;
            this.resolvedAddress = "";
        }
        return TempTableEntry;
    })();
})(Compiler || (Compiler = {}));
