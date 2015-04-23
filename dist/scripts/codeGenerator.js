var Compiler;
(function (Compiler) {
    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.generateCode = function (abstractSyntaxTree, symbolTable) {
            Compiler.Logger.log("Generating 6502a Assembly Code (NOT IMPLEMENTED)");
            Compiler.Logger.log("");

            this.setupEnvironment(abstractSyntaxTree, symbolTable);

            this.buildCode(abstractSyntaxTree.getRoot());
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
        };

        CodeGenerator.buildCode = function (root) {
            Compiler.Logger.log("Node: " + root.getValue());

            switch (root.getValue()) {
                case astNodeTypes.BLOCK:
                    Compiler.Logger.log("Block node");
                    break;

                case astNodeTypes.VAR_DECLARATION:
                    Compiler.Logger.log("Variable declaration");

                    var type = root.getChildren()[0].getTypeInfo();
                    var idName = root.getChildren()[1].getValue();

                    Compiler.Logger.log(type + " " + idName);

                    this.varDeclarationTemplate(type, idName);

                    break;

                case astNodeTypes.ASSIGNMENT_STATEMENT:
                    Compiler.Logger.log("Assignment statement");

                    var idName = root.getChildren()[0].getValue();
                    var type = root.getChildren()[0].getSymbolTableEntry().getIdType();

                    // TODO: Doesn't work for 1 + 2 + 3 + a + ... cases
                    var value = root.getChildren()[1].getValue();

                    this.assignmentDeclarationTemplate(idName, type, value);

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

        // TODO: Case where string declared, then int/bool causes int/bool to skip a space in static space
        CodeGenerator.varDeclarationTemplate = function (type, idName) {
            Compiler.Logger.log("Template for variable declaration");

            if (type === types.INT || type === types.BOOLEAN) {
                // Load accumulator with 0
                this.setCode("A9");
                this.setCode("00");

                var tempName = "T" + this.tempTable.length.toString();
                var tempOffset = this.tempTable.length;

                var newEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.addressOffset = tempOffset;

                this.tempTable.push(newEntry);

                // Store accumulator at address of id (placeholder address for now)
                this.setCode("8D");
                this.setCode(tempName);
                this.setCode("XX");
            } else {
                // TODO: Remove after testing
                Compiler.Logger.log("String declaration");

                var tempName = "T" + this.tempTable.length.toString();

                var newEntry = new TempTableEntry();
                newEntry.tempName = tempName;
                newEntry.idName = idName;
                newEntry.addressOffset = -1;

                this.tempTable.push(newEntry);
            }
        };

        CodeGenerator.assignmentDeclarationTemplate = function (idName, idType, value) {
            if (idType === types.INT) {
                Compiler.Logger.log("Int assignment (NOT IMPLEMENTED)");
            } else if (idType === types.BOOLEAN) {
                // TODO: Convert value to 0 (false) or 1 (true)
                Compiler.Logger.log("Bool assignment (NOT IMPLEMENTED)");
            } else {
                Compiler.Logger.log("String assignment (NOT IMPLEMENTED)");
            }
        };

        CodeGenerator.printStatementTemplate = function (printNode) {
            var typeToPrint = printNode.getTypeInfo();

            Compiler.Logger.log("Template of print");
            Compiler.Logger.log("Printing type " + typeToPrint);

            var firstChildNode = printNode.getChildren()[0];

            // Compound expression (addition involved)
            if (firstChildNode.getNodeType() === treeNodeTypes.INTERIOR) {
                Compiler.Logger.log("Printing found interior node, so doing addition (NOT IMPLEMENTED)");
            } else if (firstChildNode.getTokenType() === TokenType[11 /* T_DIGIT */]) {
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
                var id = firstChildNode.getValue();
                var tempName = this.getEntryNameById(id);

                // Load the Y register from the memory address of the id
                this.setCode("AC");
                this.setCode(tempName);
                this.setCode("XX");

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            } else {
            }
        };

        CodeGenerator.setCode = function (input) {
            this.codeList[this.currentIndex] = input;
            this.currentIndex++;
        };

        CodeGenerator.setCodeAtIndex = function (index, input) {
            this.codeList[index] = input;
        };

        CodeGenerator.backPatchCode = function () {
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

                    // TODO: Remove after testing (or make verbose only)
                    Compiler.Logger.log("New index for entry " + currentCodeByte + " is: " + hexLocation);
                    tempTableEntry.resolvedAddress = hexLocation;

                    this.setCodeAtIndex(cursorIndex, hexLocation);
                    this.setCodeAtIndex(cursorIndex + 1, "00");
                }
            }
        };

        // TODO: Delete after testing
        CodeGenerator.debugPrintTempTable = function () {
            if (this.tempTable.length > 0) {
                Compiler.Logger.log("");
                Compiler.Logger.log("Temp Table");
                Compiler.Logger.log("--------------------------------");

                for (var i = 0; i < this.tempTable.length; i++) {
                    var entry = this.tempTable[i];

                    Compiler.Logger.log(entry.tempName + " | " + entry.idName + " | " + entry.addressOffset + " | " + entry.resolvedAddress);
                }
            }
        };

        CodeGenerator.getEntryNameById = function (idName) {
            var currentEntry = null;
            var entryFound = false;

            for (var i = this.tempTable.length - 1; i >= 0 && !entryFound; i--) {
                currentEntry = this.tempTable[i];

                if (currentEntry.idName === idName) {
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
            this.addressOffset = -1;
            this.resolvedAddress = "";
        }
        return TempTableEntry;
    })();
})(Compiler || (Compiler = {}));
