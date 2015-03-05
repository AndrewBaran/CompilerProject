var Compiler;
(function (Compiler) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.parseCode = function (tokenList, symbolTable) {
            this.setupParsingEnvironment(tokenList, symbolTable);

            Compiler.Logger.log("Parsing the code");
            Compiler.Logger.log("");

            this.parseProgram();

            Compiler.Logger.log("Parsing done");
            Compiler.Logger.log("");

            return this.concreteSyntaxTree;
        };

        Parser.setupParsingEnvironment = function (tokenList, symbolTable) {
            this.tokenList = tokenList;
            this.symbolTable = symbolTable;

            this.currentTokenIndex = 0;

            this.concreteSyntaxTree = new Compiler.ConcreteSyntaxTree();
        };

        // Program: Block $
        Parser.parseProgram = function () {
            this.concreteSyntaxTree.insertInteriorNode("Program");

            this.parseBlock();
            this.parseEOF();
        };

        // Block: { StatementList }
        Parser.parseBlock = function () {
            this.concreteSyntaxTree.insertInteriorNode("Block");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a left brace");

            if (token.getType() === 4 /* T_LBRACE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a left brace!");

                this.concreteSyntaxTree.insertLeafNode(token);
                this.symbolTable.openScope();

                this.parseStatementList();

                token = this.getToken();
                Compiler.Logger.log("Expecting a right brace!");

                if (token.getType() === 5 /* T_RBRACE */) {
                    this.consumeToken();
                    Compiler.Logger.log("Got a right brace!");

                    this.concreteSyntaxTree.insertLeafNode(token);
                    this.symbolTable.closeScope();
                } else {
                    this.errorExpectedActual(5 /* T_RBRACE */, token.getType());
                }
            } else {
                this.errorExpectedActual(4 /* T_LBRACE */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // EOF: $
        Parser.parseEOF = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting an EOF");

            if (token.getType() === 8 /* T_EOF */) {
                this.consumeToken();
                Compiler.Logger.log("Got an EOF!");

                this.concreteSyntaxTree.insertLeafNode(token);
            } else {
                this.errorExpectedActual(8 /* T_EOF */, token.getType());
            }
        };

        // StatementList: Statement StatementList | ""
        Parser.parseStatementList = function () {
            this.concreteSyntaxTree.insertInteriorNode("Statement List");

            var token = this.getToken();

            switch (token.getType()) {
                case 7 /* T_PRINT */:
                case 12 /* T_ID */:
                case 17 /* T_INT */:
                case 18 /* T_STRING */:
                case 19 /* T_BOOLEAN */:
                case 9 /* T_WHILE */:
                case 10 /* T_IF */:
                case 4 /* T_LBRACE */:
                    this.parseStatement();
                    this.parseStatementList();

                    break;

                default:
                    break;
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // Statemment: PrintStatement | AssignmentStatement | VarDecl | WhileStatement | IfStatement | Block
        Parser.parseStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode("Statement");

            var token = this.getToken();

            switch (token.getType()) {
                case 7 /* T_PRINT */:
                    this.parsePrintStatement();
                    break;

                case 12 /* T_ID */:
                    this.parseAssignmentStatement();
                    break;

                case 17 /* T_INT */:
                case 18 /* T_STRING */:
                case 19 /* T_BOOLEAN */:
                    this.parseVariableDeclaration();
                    break;

                case 9 /* T_WHILE */:
                    this.parseWhileStatement();
                    break;

                case 10 /* T_IF */:
                    this.parseIfStatement();
                    break;

                case 4 /* T_LBRACE */:
                    this.parseBlock();
                    break;

                default:
                    var errorMessage = "Error on line " + this.getTokenLineNumber() + ": " + token.getTokenName() + " is not the beginning of any statement";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // PrintStatement: print ( Expr )
        Parser.parsePrintStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode("Print Statement");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a print");

            if (token.getType() === 7 /* T_PRINT */) {
                this.consumeToken();
                Compiler.Logger.log("Got a print!");

                this.concreteSyntaxTree.insertLeafNode(token);

                token = this.getToken();
                Compiler.Logger.log("Expecting a left paren");

                if (token.getType() === 2 /* T_LPAREN */) {
                    this.consumeToken();
                    Compiler.Logger.log("Got a left paren!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    this.parseExpression();

                    token = this.getToken();
                    Compiler.Logger.log("Expecting a right paren");

                    if (token.getType() === 3 /* T_RPAREN */) {
                        this.consumeToken();
                        Compiler.Logger.log("Got a right paren!");

                        this.concreteSyntaxTree.insertLeafNode(token);
                    } else {
                        this.errorExpectedActual(3 /* T_RPAREN */, token.getType());
                    }
                } else {
                    this.errorExpectedActual(2 /* T_LPAREN */, token.getType());
                }
            } else {
                this.errorExpectedActual(7 /* T_PRINT */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // AssignmentStatement: Id = Expr
        Parser.parseAssignmentStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode("Assignment Statement");

            this.parseId();

            var token = this.getToken();
            Compiler.Logger.log("Expecting an = ");

            if (token.getType() === 20 /* T_SINGLE_EQUALS */) {
                this.consumeToken();
                Compiler.Logger.log("Got a = !");

                this.concreteSyntaxTree.insertLeafNode(token);

                this.parseExpression();
            } else {
                this.errorExpectedActual(20 /* T_SINGLE_EQUALS */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // VarDecl: type Id
        Parser.parseVariableDeclaration = function () {
            this.concreteSyntaxTree.insertInteriorNode("Variable Declaration");

            var typeToken = this.getToken();
            var typeValue = typeToken.getValue();

            this.parseType();

            var idToken = this.getToken();
            var lineFoundOn = this.getTokenLineNumber();

            this.parseId();

            var result = this.symbolTable.insertEntry(idToken, typeValue);

            // TODO: Move this to semantic analysis?
            if (!result) {
                var errorMessage = "Error on line " + lineFoundOn + ": The identifier " + idToken.getValue() + " has already been declared in this scope.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // WhileStatement: while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode("While Statement");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a while");

            if (token.getType() === 9 /* T_WHILE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a while!");

                this.concreteSyntaxTree.insertLeafNode(token);

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                this.errorExpectedActual(9 /* T_WHILE */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // IfStatement: if BooleanExpr Block
        Parser.parseIfStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode("If Statement");

            var token = this.getToken();
            Compiler.Logger.log("Expecting an if");

            if (token.getType() === 10 /* T_IF */) {
                this.consumeToken();
                Compiler.Logger.log("Got an if!");

                this.concreteSyntaxTree.insertLeafNode(token);

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                this.errorExpectedActual(10 /* T_IF */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // Expr: IntExpr | String Expr | BooleanExpr | Id
        Parser.parseExpression = function () {
            this.concreteSyntaxTree.insertInteriorNode("Expression");

            var token = this.getToken();

            switch (token.getType()) {
                case 11 /* T_DIGIT */:
                    this.parseIntExpression();
                    break;

                case 6 /* T_QUOTE */:
                    this.parseStringExpression();
                    break;

                case 2 /* T_LPAREN */:
                case 25 /* T_TRUE */:
                case 24 /* T_FALSE */:
                    this.parseBooleanExpression();
                    break;

                case 12 /* T_ID */:
                    this.parseId();
                    break;

                default:
                    var errorMessage = "Error on line " + this.getTokenLineNumber() + ": " + token.getTokenName() + " is not the beginning of any expression";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // IntExpr: digit intop Expr | digit
        Parser.parseIntExpression = function () {
            this.concreteSyntaxTree.insertInteriorNode("Int Expression");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a digit");

            if (token.getType() === 11 /* T_DIGIT */) {
                this.consumeToken();
                Compiler.Logger.log("Got a digit!");

                this.concreteSyntaxTree.insertLeafNode(token);

                var intOpExisted = this.parseIntOperator();

                if (intOpExisted) {
                    this.parseExpression();
                }
            } else {
                this.errorExpectedActual(11 /* T_DIGIT */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // StringExpr: " CharList "
        Parser.parseStringExpression = function () {
            this.concreteSyntaxTree.insertInteriorNode("String Expression");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a quotation mark");

            if (token.getType() === 6 /* T_QUOTE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a quotation mark!");

                this.concreteSyntaxTree.insertLeafNode(token);

                this.parseCharList();

                token = this.getToken();
                Compiler.Logger.log("Expecting a quotation mark");

                if (token.getType() === 6 /* T_QUOTE */) {
                    this.consumeToken();
                    Compiler.Logger.log("Got a quotation mark!");

                    this.concreteSyntaxTree.insertLeafNode(token);
                } else {
                    this.errorExpectedActual(6 /* T_QUOTE */, token.getType());
                }
            } else {
                this.errorExpectedActual(6 /* T_QUOTE */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // BooleanExpr: ( Expr boolop Expr ) | boolval
        Parser.parseBooleanExpression = function () {
            this.concreteSyntaxTree.insertInteriorNode("Boolean Expression");

            var token = this.getToken();
            Compiler.Logger.log("Potentially expecting a left paren, true, or false");

            switch (token.getType()) {
                case 2 /* T_LPAREN */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a left paren!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    this.parseExpression();
                    this.parseBooleanOperator();
                    this.parseExpression();

                    token = this.getToken();
                    Compiler.Logger.log("Expecting a right paren");

                    if (token.getType() === 3 /* T_RPAREN */) {
                        this.consumeToken();
                        Compiler.Logger.log("Got a right paren!");

                        this.concreteSyntaxTree.insertLeafNode(token);
                    } else {
                        this.errorExpectedActual(3 /* T_RPAREN */, token.getType());
                    }

                    break;

                case 25 /* T_TRUE */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a true!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                case 24 /* T_FALSE */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a false!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                default:
                    var errorMessage = "Error on line " + token.getTokenName() + ": " + token.getTokenName() + " is not the beginning of any boolean expression";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // int | string | boolean
        Parser.parseType = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a type");

            switch (token.getType()) {
                case 17 /* T_INT */:
                    this.consumeToken();
                    Compiler.Logger.log("Got an int type!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                case 18 /* T_STRING */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a string type!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                case 19 /* T_BOOLEAN */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a boolean type!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                default:
                    this.errorExpectedActual(16 /* T_TYPE */, token.getType());
                    break;
            }
        };

        // Id: char
        Parser.parseId = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting an id");

            if (token.getType() === 12 /* T_ID */) {
                this.consumeToken();
                Compiler.Logger.log("Got an id!");

                this.concreteSyntaxTree.insertLeafNode(token);
            } else {
                this.errorExpectedActual(12 /* T_ID */, token.getType());
            }
        };

        // CharList: char CharList | space CharList | ""
        Parser.parseCharList = function () {
            this.concreteSyntaxTree.insertInteriorNode("Char List");

            var token = this.getToken();
            Compiler.Logger.log("Potentially expecting a string character");

            if (token.getType() === 13 /* T_CHAR */ || token.getType() === 26 /* T_WHITE_SPACE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a string character!");

                this.concreteSyntaxTree.insertLeafNode(token);

                this.parseCharList();
            } else {
                // Epsilon case
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // +
        Parser.parseIntOperator = function () {
            var token = this.getToken();
            Compiler.Logger.log("Potentially expecting a plus operator");

            if (token.getType() === 14 /* T_PLUS */) {
                this.consumeToken();
                Compiler.Logger.log("Got a plus operator!");

                this.concreteSyntaxTree.insertLeafNode(token);

                return true;
            } else {
                return false;
            }
        };

        // == | !=
        Parser.parseBooleanOperator = function () {
            var token = this.getToken();

            switch (token.getType()) {
                case 21 /* T_DOUBLE_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a double equals!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                case 22 /* T_NOT_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a not equals!");

                    this.concreteSyntaxTree.insertLeafNode(token);

                    break;

                default:
                    var errorMessage = "Error on line " + this.getTokenLineNumber() + ": " + token.getTokenName() + " is not a valid boolean operator.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        Parser.getToken = function () {
            var token = this.tokenList[this.currentTokenIndex].token;
            return token;
        };

        Parser.getPreviousToken = function () {
            var token = this.tokenList[this.currentTokenIndex - 1].token;
            return token;
        };

        Parser.consumeToken = function () {
            this.currentTokenIndex++;
        };

        Parser.getTokenLineNumber = function () {
            var lineNumber = this.tokenList[this.currentTokenIndex].lineFoundOn;
            return lineNumber;
        };

        Parser.errorExpectedActual = function (expectedType, actualType) {
            var errorMessage = "Error on line " + this.getTokenLineNumber() + ": Expected " + TokenType[expectedType] + ", but got " + TokenType[actualType];

            Compiler.Logger.log(errorMessage);
            throw errorMessage;
        };
        return Parser;
    })();
    Compiler.Parser = Parser;
})(Compiler || (Compiler = {}));
