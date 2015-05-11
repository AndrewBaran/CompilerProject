var Compiler;
(function (Compiler) {
    var CodeGenerator = (function () {
        function CodeGenerator() {
        }
        CodeGenerator.generateCode = function (abstractSyntaxTree) {
            Compiler.Logger.log("Generating 6502a Assembly Code (NOT FINISHED)");
            Compiler.Logger.log("");

            this.setupEnvironment(abstractSyntaxTree);

            this.buildCode(abstractSyntaxTree.getRoot());

            Compiler.Logger.logVerbose("Inserting Break Statement");
            this.setCode("00"); // Program break

            this.backPatchCode();

            // TODO: Delete after testing
            this.debugPrintTempTable();
            this.debugPrintJumpTable();

            Compiler.Logger.logVerbose("");
            Compiler.Logger.log("Code Generation Completed");

            return this.codeList;
        };

        CodeGenerator.setupEnvironment = function (abstractSyntaxTree) {
            this.abstractSyntaxTree = abstractSyntaxTree;

            this.codeList = [];

            for (var i = 0; i < _Constants.MAX_CODE_SIZE; i++) {
                this.codeList[i] = "00";
            }

            this.currentIndex = 0;

            this.tempTable = [];
            this.jumpTable = [];

            this.heapPointer = _Constants.MAX_CODE_SIZE;
        };

        // TODO: Add while and if statements
        CodeGenerator.buildCode = function (root) {
            var conditionalBlockEntered = false;
            var jumpPatchInfo = null;
            var jumpBackIndex = -1;

            switch (root.getValue()) {
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
                    var leftChildNode = root.getChildren()[0];
                    jumpPatchInfo = this.evaluateBooleanCondition(leftChildNode);

                    conditionalBlockEntered = true;

                    break;

                case astNodeTypes.WHILE_STATEMENT:
                    // Set jump point back to here after while block is done
                    jumpBackIndex = this.currentIndex;

                    var leftChildNode = root.getChildren()[0];
                    jumpPatchInfo = this.evaluateBooleanCondition(leftChildNode);

                    conditionalBlockEntered = true;

                    break;

                default:
                    break;
            }

            for (var i = 0; i < root.getChildren().length; i++) {
                this.buildCode(root.getChildren()[i]);
            }

            // Set the proper distance to jump to be backpatched later
            if (conditionalBlockEntered) {
                // Set the proper distance for jumping back to testing conditional (for while)
                if (jumpBackIndex !== -1) {
                    // Ensure we always jump back to beginning of while conditional
                    // Load X register with 0
                    this.setCode("A2");
                    this.setCode("00");

                    // Use a new temp variable to store 1, so we can always branch back
                    var tempEntry = this.insertNewTempEntry();

                    // Load accumulator with 1
                    this.setCode("A9");
                    this.setCode("01");

                    // Store accumulator at address of conditional result
                    this.setCode("8D");
                    this.setCode(tempEntry.tempName);
                    this.setCode("XX");

                    // Compare X Register (0) and Temp Entry (1). Will always set Z flag to 0, so we will always branch
                    this.setCode("EC");
                    this.setCode(tempEntry.tempName);
                    this.setCode("XX");

                    var jumpBackEntry = this.insertNewJumpEntry();

                    // Branch back to beginning of while loop
                    this.setCode("D0");
                    this.setCode(jumpBackEntry.tempName);

                    // Wrap around back to start of while's conditional
                    jumpBackEntry.distance = (_Constants.MAX_CODE_SIZE - (this.currentIndex - jumpBackIndex));
                }

                // Set the proper distance to jump for branch not equal (block was not executed)
                var substringIndex = parseInt(jumpPatchInfo.tempName.substring(1), 10);

                var jumpEntry = this.jumpTable[substringIndex];
                jumpEntry.distance = this.currentIndex - jumpPatchInfo.startAddressOfBlock;

                conditionalBlockEntered = false;
            }
        };

        CodeGenerator.varDeclarationTemplate = function (declarationNode) {
            var type = declarationNode.getChildren()[0].getValue();
            var idName = declarationNode.getChildren()[1].getValue();
            var scopeLevel = declarationNode.getChildren()[1].getSymbolTableEntry().getScopeLevel();

            if (type === types.INT || type === types.BOOLEAN) {
                Compiler.Logger.logVerbose("Inserting Int / Boolean Declaration of id " + idName);

                // Load accumulator with 0 (the default value for ints and booleans (false))
                this.setCode("A9");
                this.setCode("00");

                var newEntry = this.insertNewTempEntry();
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;

                // Store accumulator at address of id (placeholder address for now)
                this.setCode("8D");
                this.setCode(newEntry.tempName);
                this.setCode("XX");
            } else {
                Compiler.Logger.logVerbose("Inserting String Declaration of id " + idName);

                var newEntry = this.insertNewTempEntry();
                newEntry.idName = idName;
                newEntry.scopeLevel = scopeLevel;

                // Load accumulator with 00, the null string
                this.setCode("A9");
                this.setCode("00");

                // Store the accumulator at the address of the string id
                this.setCode("8D");
                this.setCode(newEntry.tempName);
                this.setCode("XX");
            }
        };

        CodeGenerator.assignmentDeclarationTemplate = function (assignmentNode) {
            var idNode = assignmentNode.getChildren()[0];
            var id = idNode.getValue();

            var idType = assignmentNode.getTypeInfo();

            if (idType === types.INT) {
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
                    Compiler.Logger.logVerbose("Inserting Integer Assignment of addition result to id " + id);

                    var addressesToAdd = [];
                    addressesToAdd = this.insertAddLocations(rightChildNode, addressesToAdd);

                    var addressOfSum = this.insertAddCode(addressesToAdd);
                    var firstByte = addressOfSum.split(" ")[0];
                    var secondByte = addressOfSum.split(" ")[1];

                    // Load contents of the address of the sum to accumulator
                    this.setCode("AD");
                    this.setCode(firstByte);
                    this.setCode(secondByte);

                    var lhsScopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                    var tempName = this.getEntryNameById(id, lhsScopeLevel);

                    // Store contents of the accumulator (containing sum of addition) in address of LHS id
                    this.setCode("8D");
                    this.setCode(tempName);
                    this.setCode("XX");
                }
            } else if (idType === types.BOOLEAN) {
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
                    Compiler.Logger.logVerbose("Inserting Boolean Assignment of Boolean Expression to id " + id);

                    var addressOfResult = this.parseBooleanTree(rightChildNode);

                    var resultFirstByte = addressOfResult.split(" ")[0];
                    var resultSecondByte = addressOfResult.split(" ")[1];

                    // Load accumulator with address of result
                    this.setCode("AD");
                    this.setCode(resultFirstByte);
                    this.setCode(resultSecondByte);

                    var lhsScopeLevel = idNode.getSymbolTableEntry().getScopeLevel();
                    var lhsTempName = this.getEntryNameById(id, lhsScopeLevel);

                    // Store accumulator at address of id in assignment
                    this.setCode("8D");
                    this.setCode(lhsTempName);
                    this.setCode("XX");
                }
            } else {
                var leftChildNode = assignmentNode.getChildren()[0];
                var rightChildNode = assignmentNode.getChildren()[1];

                // Assigning a string literal
                if (rightChildNode.getTokenType() === TokenType[27 /* T_STRING_EXPRESSION */]) {
                    var id = leftChildNode.getValue();
                    var value = rightChildNode.getValue();

                    Compiler.Logger.logVerbose("Inserting String Assignment of id " + id + " to string \"" + value + "\"");

                    var startAddress = Compiler.Utils.decimalToHex(this.addToHeap(value));

                    var scopeLevel = leftChildNode.getSymbolTableEntry().getScopeLevel();
                    var tempName = this.getEntryNameById(id, scopeLevel);

                    // Load accumulator with the address of the string
                    this.setCode("A9");
                    this.setCode(startAddress);

                    // Store the value of the accumulator at the address of the string variable
                    this.setCode("8D");
                    this.setCode(tempName);
                    this.setCode("XX");
                } else if (rightChildNode.getTokenType() === TokenType[12 /* T_ID */]) {
                    var lhsId = leftChildNode.getValue();
                    var lhsScopeLevel = leftChildNode.getSymbolTableEntry().getScopeLevel();
                    var lhsTempName = this.getEntryNameById(lhsId, lhsScopeLevel);

                    var rhsId = rightChildNode.getValue();
                    var rhsScopeLevel = rightChildNode.getSymbolTableEntry().getScopeLevel();
                    var rhsTempName = this.getEntryNameById(rhsId, rhsScopeLevel);

                    Compiler.Logger.logVerbose("Inserting String Assignment of id " + rhsId + " to id " + lhsId);

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
        };

        CodeGenerator.printStatementTemplate = function (printNode) {
            var firstChildNode = printNode.getChildren()[0];

            // Integer addition
            if (firstChildNode.getValue() === astNodeTypes.ADD) {
                Compiler.Logger.logVerbose("Inserting Print Statement of Integer Addition");

                var addressesToAdd = [];
                addressesToAdd = this.insertAddLocations(firstChildNode, addressesToAdd);

                var addressOfSum = this.insertAddCode(addressesToAdd);
                var firstByte = addressOfSum.split(" ")[0];
                var secondByte = addressOfSum.split(" ")[1];

                // Load Y register with the number being printed
                this.setCode("AC");
                this.setCode(firstByte);
                this.setCode(secondByte);

                // Load 1 into X register to get ready to print an int
                this.setCode("A2");
                this.setCode("01");

                // System call
                this.setCode("FF");
            } else if (firstChildNode.getValue() === astNodeTypes.EQUAL || firstChildNode.getValue() === astNodeTypes.NOT_EQUAL) {
                Compiler.Logger.logVerbose("Inserting Print Statement of Boolean Expression");

                var addressOfResult = this.parseBooleanTree(firstChildNode);

                var firstByte = addressOfResult.split(" ")[0];
                var secondByte = addressOfResult.split(" ")[1];

                // Load X register with 1 to get ready to print int (same representation as true / false)
                this.setCode("A2");
                this.setCode("01");

                // Load Y register with address of result of the boolean operation
                this.setCode("AC");
                this.setCode(firstByte);
                this.setCode(secondByte);

                // System call
                this.setCode("FF");
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

        // Inserts the code to add each digit / id being summed together into memory
        // Return list of those addresses being summed together
        CodeGenerator.insertAddLocations = function (rootNode, addressesToAdd) {
            if (rootNode.getNodeType() === treeNodeTypes.LEAF) {
                if (rootNode.getTokenType() === TokenType[12 /* T_ID */]) {
                    // Get tempName of id
                    var id = rootNode.getValue();
                    var scopeLevel = rootNode.getSymbolTableEntry().getScopeLevel();
                    var tempName = this.getEntryNameById(id, scopeLevel);

                    Compiler.Logger.logVerbose("Found id " + id + " to add");

                    var address = tempName + " " + "XX";

                    // Add address of tempName to list to be added together
                    addressesToAdd.push(address);
                } else if (rootNode.getTokenType() === TokenType[11 /* T_DIGIT */]) {
                    var intLiteral = "0" + rootNode.getValue();

                    // Load the accumulator with the int literal value
                    this.setCode("A9");
                    this.setCode(intLiteral);

                    // Create new temp table entry for the int literal (inefficient, but it works)
                    var newEntry = this.insertNewTempEntry();

                    // Store the accumulator at a new temp address
                    this.setCode("8D");
                    this.setCode(newEntry.tempName);
                    this.setCode("XX");

                    Compiler.Logger.logVerbose("Found digit " + intLiteral + " to add");

                    var address = newEntry.tempName + " " + "XX";
                    addressesToAdd.push(address);
                }
            }

            for (var i = 0; i < rootNode.getChildren().length; i++) {
                addressesToAdd = this.insertAddLocations(rootNode.getChildren()[i], addressesToAdd);
            }

            return addressesToAdd;
        };

        // Insert the Add with Carry instructions into code
        // Return address of location of sum
        CodeGenerator.insertAddCode = function (addLocations) {
            // Set accumulator to 0 so you can start adding
            this.setCode("A9");
            this.setCode("00");

            while (addLocations.length > 0) {
                var address = addLocations.pop();

                var firstByte = address.split(" ")[0];
                var secondByte = address.split(" ")[1];

                // Add contents of the address to the accumulator
                this.setCode("6D");
                this.setCode(firstByte);
                this.setCode(secondByte);
            }

            // Create new entry for the location of the sum
            var newEntry = this.insertNewTempEntry();

            // Store the accumulator, now holding the sum, at an address in memory and return that address
            this.setCode("8D");
            this.setCode(newEntry.tempName);
            this.setCode("XX");

            return newEntry.tempName + " " + "XX";
        };

        // Return address of the beginning of the block, so we can backpatch jump code later
        CodeGenerator.evaluateBooleanCondition = function (root) {
            Compiler.Logger.logVerbose("Evaluating condition for if / while statement");

            if (root.getTokenType() === TokenType[25 /* T_TRUE */]) {
                Compiler.Logger.logVerbose("Condition of if / while statement is true");

                // Load accumulator with 1 (true)
                this.setCode("A9");
                this.setCode("01");

                var tempEntry = this.insertNewTempEntry();

                // Store the accumulator at an address in memory to be compared against
                this.setCode("8D");
                this.setCode(tempEntry.tempName);
                this.setCode("XX");

                // Load X register with 0 (false)
                this.setCode("A2");
                this.setCode("01");

                // Compare X register and address in memory (1 == 1, so Z-flag is set to 1)
                this.setCode("EC");
                this.setCode(tempEntry.tempName);
                this.setCode("XX");

                var jumpEntry = this.insertNewJumpEntry();

                // Z-flag will be set to 1, so it won't branch
                this.setCode("D0");
                this.setCode(jumpEntry.tempName);

                var jumpInfo = new JumpPatchInfo();
                jumpInfo.tempName = jumpEntry.tempName;
                jumpInfo.startAddressOfBlock = this.currentIndex;

                return jumpInfo;
            } else if (root.getTokenType() === TokenType[24 /* T_FALSE */]) {
                Compiler.Logger.logVerbose("Condition of if / while statement is false");

                // Load accumulator with 0 (false)
                this.setCode("A9");
                this.setCode("00");

                var tempEntry = this.insertNewTempEntry();

                // Store the accumulator at an address in memory to be compared against
                this.setCode("8D");
                this.setCode(tempEntry.tempName);
                this.setCode("XX");

                // Load X register with 1 (true)
                this.setCode("A2");
                this.setCode("01");

                // Compare X register and address in memory (0 != 1, so Z-flag is set to 0)
                this.setCode("EC");
                this.setCode(tempEntry.tempName);
                this.setCode("XX");

                var jumpEntry = this.insertNewJumpEntry();

                // Z-flag will be set to 0, so we will always branch
                this.setCode("D0");
                this.setCode(jumpEntry.tempName);

                var jumpInfo = new JumpPatchInfo();
                jumpInfo.tempName = jumpEntry.tempName;
                jumpInfo.startAddressOfBlock = this.currentIndex;

                return jumpInfo;
            } else if (root.getNodeType() === treeNodeTypes.INTERIOR) {
                Compiler.Logger.logVerbose("Condition of if / while statement is a boolean expression");

                var addressOfResult = this.parseBooleanTree(root);

                var firstByte = addressOfResult.split(" ")[0];
                var secondByte = addressOfResult.split(" ")[1];

                // Load the X register with 1 for comparison (true condition will execute loop)
                this.setCode("A2");
                this.setCode("01");

                // Compare X register with address of the result of the boolean condition
                this.setCode("EC");
                this.setCode(firstByte);
                this.setCode(secondByte);

                var jumpEntry = this.insertNewJumpEntry();

                // Branch not equal around block of while / if
                this.setCode("D0");
                this.setCode(jumpEntry.tempName);

                var jumpInfo = new JumpPatchInfo();
                jumpInfo.tempName = jumpEntry.tempName;
                jumpInfo.startAddressOfBlock = this.currentIndex;

                return jumpInfo;
            }
        };

        // Postorder traversal of boolean expression subtree
        // After visiting children, send up address of result back to parent
        CodeGenerator.parseBooleanTree = function (root) {
            var resultAddress = "";

            if (root !== null) {
                var leftAddress = "";
                var rightAddress = "";

                if (root.getNodeType() === treeNodeTypes.INTERIOR) {
                    leftAddress = this.parseBooleanTree(root.getChildren()[0]);
                    rightAddress = this.parseBooleanTree(root.getChildren()[1]);

                    if (leftAddress !== "" && rightAddress !== "") {
                        var leftFirstByte = leftAddress.split(" ")[0];
                        var leftSecondByte = leftAddress.split(" ")[1];

                        var rightFirstByte = rightAddress.split(" ")[0];
                        var rightSecondByte = rightAddress.split(" ")[1];

                        // Load left address into X register
                        this.setCode("AE");
                        this.setCode(leftFirstByte);
                        this.setCode(leftSecondByte);

                        // Compare the right address to the left (which is in the X register)
                        this.setCode("EC");
                        this.setCode(rightFirstByte);
                        this.setCode(rightSecondByte);

                        // Lot of duplicate code, but I have a lot of brain damage trying to work this out, so...
                        if (root.getValue() === astNodeTypes.EQUAL) {
                            Compiler.Logger.logVerbose("Evaluating if " + leftFirstByte + " == " + rightFirstByte);

                            // Result address
                            var tempEntry = this.insertNewTempEntry();

                            var jumpEntryNotEqual = this.insertNewJumpEntry();
                            var jumpEntryEqual = this.insertNewJumpEntry();

                            this.jumpTable.push(jumpEntryNotEqual);
                            this.jumpTable.push(jumpEntryEqual);

                            // Store 0 in the result address as default
                            // Load accumulator with 0
                            this.setCode("A9");
                            this.setCode("00");

                            // Store the accumulator at result address
                            this.setCode("8D");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            // Branch around if z = 0 (true == false or false == true)
                            this.setCode("D0");
                            this.setCode(jumpEntryNotEqual.tempName);

                            var firstJumpIndex = this.currentIndex;

                            // Case where true == true or false == false; both evaluate to true
                            // Load accumulator with 1 (true)
                            this.setCode("A9");
                            this.setCode("01");

                            // Store accumulator at temp address
                            this.setCode("8D");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            // Set distance to jump after branch not equal
                            jumpEntryNotEqual.distance = this.currentIndex - firstJumpIndex;

                            // Set up for next jump
                            // Load X register with 0
                            this.setCode("A2");
                            this.setCode("00");

                            // Compare X register and result address
                            this.setCode("EC");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            // Branch around if z = 0 (If we did above case, where true == true or false == false)
                            this.setCode("D0");
                            this.setCode(jumpEntryEqual.tempName);

                            var secondJumpIndex = this.currentIndex;

                            // Case where true == false or false == true; both evaluate to false
                            // Load accumulator with 0 (false)
                            this.setCode("A9");
                            this.setCode("00");

                            // Store accumulator at temp address
                            this.setCode("8D");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            jumpEntryEqual.distance = this.currentIndex - secondJumpIndex;

                            resultAddress = tempEntry.tempName + " " + "XX";
                        } else if (root.getValue() === astNodeTypes.NOT_EQUAL) {
                            Compiler.Logger.logVerbose("Evaluating if " + leftFirstByte + " != " + rightFirstByte);

                            // Result address
                            var tempEntry = this.insertNewTempEntry();

                            var jumpEntryNotEqual = this.insertNewJumpEntry();
                            var jumpEntryEqual = this.insertNewJumpEntry();

                            this.jumpTable.push(jumpEntryNotEqual);
                            this.jumpTable.push(jumpEntryEqual);

                            // Store 1 in the result address as default
                            // Load accumulator with 1
                            this.setCode("A9");
                            this.setCode("01");

                            // Store the accumulator at result address
                            this.setCode("8D");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            // Branch around if z = 0 (true != false or false != true)
                            this.setCode("D0");
                            this.setCode(jumpEntryNotEqual.tempName);

                            var firstJumpIndex = this.currentIndex;

                            // Case where true != true or false != false; both evaluate to false
                            // Load accumulator with 0 (false)
                            this.setCode("A9");
                            this.setCode("00");

                            // Store accumulator at temp address
                            this.setCode("8D");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            // Set distance to jump after branch not equal
                            jumpEntryNotEqual.distance = this.currentIndex - firstJumpIndex;

                            // Set up for next jump
                            // Load X register with 1
                            this.setCode("A2");
                            this.setCode("01");

                            // Compare X register and result address
                            this.setCode("EC");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            // Branch around if z = 0 (If we did above case, where true != true or false != false)
                            this.setCode("D0");
                            this.setCode(jumpEntryEqual.tempName);

                            var secondJumpIndex = this.currentIndex;

                            // Case where true != false or false != true; both evaluate to true
                            // Load accumulator with 1 (true)
                            this.setCode("A9");
                            this.setCode("01");

                            // Store accumulator at temp address
                            this.setCode("8D");
                            this.setCode(tempEntry.tempName);
                            this.setCode("XX");

                            jumpEntryEqual.distance = this.currentIndex - secondJumpIndex;

                            resultAddress = tempEntry.tempName + " " + "XX";
                        } else if (root.getValue() === astNodeTypes.ADD) {
                            var errorMessage = "Error! Comparison involving addition on line " + root.getLineNumber() + "is currently unsupported.";

                            Compiler.Logger.log(errorMessage);
                            throw errorMessage;
                        }
                    }
                } else if (root.getNodeType() === treeNodeTypes.LEAF) {
                    if (root.getTokenType() === TokenType[11 /* T_DIGIT */]) {
                        Compiler.Logger.logVerbose("Propagating addresss of digit");

                        // Load accumulator with value of digit
                        this.setCode("A9");
                        this.setCode("0" + root.getValue());

                        var tempEntry = this.insertNewTempEntry();

                        // Store the accumulator at a temp address
                        this.setCode("8D");
                        this.setCode(tempEntry.tempName);
                        this.setCode("XX");

                        resultAddress = tempEntry.tempName + " " + "XX";
                    } else if (root.getTokenType() === TokenType[25 /* T_TRUE */]) {
                        Compiler.Logger.logVerbose("Propagating addresss of true");

                        // Load the accumulator with 1 (true)
                        this.setCode("A9");
                        this.setCode("01");

                        var tempEntry = this.insertNewTempEntry();

                        // Store the accumulator at a temp address
                        this.setCode("8D");
                        this.setCode(tempEntry.tempName);
                        this.setCode("XX");

                        Compiler.Logger.logVerbose("Address being propagated: " + tempEntry.tempName);

                        resultAddress = tempEntry.tempName + " " + "XX";
                    } else if (root.getTokenType() === TokenType[24 /* T_FALSE */]) {
                        Compiler.Logger.logVerbose("Propagating addresss of false");

                        // Load the accumulator with 0 (false)
                        this.setCode("A9");
                        this.setCode("00");

                        var tempEntry = this.insertNewTempEntry();

                        // Store the accumulator at a temp address
                        this.setCode("8D");
                        this.setCode(tempEntry.tempName);
                        this.setCode("XX");

                        resultAddress = tempEntry.tempName + " " + "XX";
                    } else if (root.getTokenType() === TokenType[12 /* T_ID */]) {
                        var idName = root.getValue();
                        var scopeLevel = root.getSymbolTableEntry().getScopeLevel();

                        var idTempName = this.getEntryNameById(idName, scopeLevel);

                        Compiler.Logger.logVerbose("Propagating address of id " + idName);

                        // Pass back address of id, as it is already in memory
                        resultAddress = idTempName + " " + "XX";
                    } else if (root.getTokenType() === TokenType[27 /* T_STRING_EXPRESSION */]) {
                        var errorMessage = "Error! Comparison involving string literal on line " + root.getLineNumber() + " is currently unsupported.";

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                }
            }

            return resultAddress;
        };

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
            if ((index + 1) <= this.heapPointer) {
                this.codeList[index] = input;
            } else {
                var errorMessage = "Error! Stack overflow at address " + Compiler.Utils.decimalToHex(this.currentIndex + 1) + " when attempting to insert the code " + input;

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        CodeGenerator.backPatchCode = function () {
            Compiler.Logger.logVerbose("Backpatching the code and resolving addresses");

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

                    if (parseInt(hexLocation, 16) < this.heapPointer) {
                        Compiler.Logger.logVerbose("Resolving entry of " + currentCodeByte + " to: " + hexLocation);

                        tempTableEntry.resolvedAddress = hexLocation;

                        this.setCodeAtIndex(hexLocation, cursorIndex);
                        this.setCodeAtIndex("00", cursorIndex + 1);
                    } else {
                        var errorMessage = "Error! Static space is clashing with heap space (beginning at " + Compiler.Utils.decimalToHex(this.heapPointer) + ") when " + tempTableEntry.tempName + " was resolved to address " + hexLocation;

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                } else if (/^J/.test(currentCodeByte)) {
                    var substringIndex = parseInt(currentCodeByte.substring(1), 10);
                    var jumpTableEntry = this.jumpTable[substringIndex];

                    var distanceToJump = Compiler.Utils.decimalToHex(jumpTableEntry.distance);

                    Compiler.Logger.logVerbose("Resolving jump entry of " + currentCodeByte + " to: " + distanceToJump);
                    this.setCodeAtIndex(distanceToJump, cursorIndex);
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

        // Created new entry in table, and return entry
        CodeGenerator.insertNewTempEntry = function () {
            var tempName = "T" + this.tempTable.length.toString();
            var tempOffset = this.tempTable.length;

            var newEntry = new TempTableEntry();
            newEntry.tempName = tempName;
            newEntry.addressOffset = tempOffset;

            this.tempTable.push(newEntry);

            return newEntry;
        };

        // Create a new jump entry in the table, and return the entry
        CodeGenerator.insertNewJumpEntry = function () {
            var tempName = "J" + this.jumpTable.length.toString();

            var newEntry = new JumpTableEntry();
            newEntry.tempName = tempName;

            this.jumpTable.push(newEntry);

            return newEntry;
        };

        // TODO: Delete after testing
        CodeGenerator.debugPrintTempTable = function () {
            if (this.tempTable.length > 0) {
                Compiler.Logger.logVerbose("");
                Compiler.Logger.logVerbose("Temp Table");
                Compiler.Logger.logVerbose("--------------------------------");

                for (var i = 0; i < this.tempTable.length; i++) {
                    var entry = this.tempTable[i];

                    Compiler.Logger.logVerbose(entry.tempName + " | " + entry.idName + " | " + entry.addressOffset + " | " + entry.resolvedAddress + " | " + entry.scopeLevel);
                }
            }
        };

        // TODO: Delete after testing
        CodeGenerator.debugPrintJumpTable = function () {
            if (this.jumpTable.length > 0) {
                Compiler.Logger.logVerbose("");
                Compiler.Logger.logVerbose("Jump Table");
                Compiler.Logger.logVerbose("--------------------------------");

                for (var i = 0; i < this.jumpTable.length; i++) {
                    var entry = this.jumpTable[i];

                    Compiler.Logger.logVerbose(entry.tempName + " | " + entry.distance + " (Decimal)");
                }
            }
        };

        // Gets the tempName of the id at the specified scope
        CodeGenerator.getEntryNameById = function (idName, scopeLevel) {
            var currentEntry = null;
            var entryFound = false;

            for (var i = this.tempTable.length - 1; i >= 0 && !entryFound; i--) {
                currentEntry = this.tempTable[i];

                if (currentEntry.idName === idName && currentEntry.scopeLevel === scopeLevel) {
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

    var JumpTableEntry = (function () {
        function JumpTableEntry() {
            this.tempName = "";
            this.distance = -1;
        }
        return JumpTableEntry;
    })();

    var JumpPatchInfo = (function () {
        function JumpPatchInfo() {
            this.tempName = "";
            this.startAddressOfBlock = -1;
        }
        return JumpPatchInfo;
    })();
})(Compiler || (Compiler = {}));
