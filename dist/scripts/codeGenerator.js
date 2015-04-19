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
                    Compiler.Logger.log("Print statement");
                    break;

                default:
                    break;
            }

            for (var i = 0; i < root.getChildren().length; i++) {
                this.buildCode(root.getChildren()[i]);
            }
        };

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
                Compiler.Logger.log("String declaration (NOT IMPLEMENTED)");
            }
        };

        CodeGenerator.assignmentDeclarationTemplate = function (idName, idType, value) {
            if (idType === types.INT) {
                Compiler.Logger.log("Assignment of int");
            } else if (idType === types.BOOLEAN) {
                // TODO: Convert value to 0 (false) or 1 (true) or use string rep of true / false
            } else {
                Compiler.Logger.log("String assignment (NOT IMPLEMENTED)");
            }
        };

        CodeGenerator.setCode = function (input) {
            this.codeList[this.currentIndex] = input;
            this.currentIndex++;
        };

        // TODO: Delete after testing
        CodeGenerator.debugPrintTempTable = function () {
            if (this.tempTable.length > 0) {
                Compiler.Logger.log("Temp Table");
                Compiler.Logger.log("----------------");

                for (var i = 0; i < this.tempTable.length; i++) {
                    var entry = this.tempTable[i];

                    Compiler.Logger.log(entry.tempName + " | " + entry.idName + " | +" + entry.addressOffset);
                }
            }
        };
        return CodeGenerator;
    })();
    Compiler.CodeGenerator = CodeGenerator;

    var TempTableEntry = (function () {
        function TempTableEntry() {
        }
        return TempTableEntry;
    })();
})(Compiler || (Compiler = {}));
