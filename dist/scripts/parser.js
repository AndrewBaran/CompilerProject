var Compiler;
(function (Compiler) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.parseCode = function (tokenList) {
            this.setupParsingEnvironment(tokenList);

            Compiler.Logger.log("Performing Parsing");
            Compiler.Logger.log("");

            this.parseProgram();

            Compiler.Logger.logVerbose("");
            Compiler.Logger.log("Parsing Complete");
            Compiler.Logger.log("Parsing produced 0 errors and 0 warnings");
            Compiler.Logger.log("");

            return this.concreteSyntaxTree;
        };

        Parser.setupParsingEnvironment = function (tokenList) {
            this.tokenList = tokenList;
            this.currentTokenIndex = 0;

            this.concreteSyntaxTree = new Compiler.ConcreteSyntaxTree();
        };

        // Program: Block $
        Parser.parseProgram = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.PROGRAM);

            this.parseBlock();
            this.parseEOF();
        };

        // Block: { StatementList }
        Parser.parseBlock = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.BLOCK);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting a left brace");

            if (token.getType() === 4 /* T_LBRACE */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a left brace!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                this.parseStatementList();

                tokenInfo = this.getTokenInfo();
                token = tokenInfo.token;
                Compiler.Logger.logVerbose("Expecting a right brace!");

                if (token.getType() === 5 /* T_RBRACE */) {
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a right brace!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);
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
            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting an EOF");

            if (token.getType() === 8 /* T_EOF */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got an EOF!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);
            } else {
                this.errorExpectedActual(8 /* T_EOF */, token.getType());
            }
        };

        // StatementList: Statement StatementList | ""
        Parser.parseStatementList = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.STATEMENT_LIST);

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
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.STATEMENT);

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
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.PRINT_STATEMENT);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting a print");

            if (token.getType() === 7 /* T_PRINT */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a print!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                tokenInfo = this.getTokenInfo();
                token = tokenInfo.token;
                Compiler.Logger.logVerbose("Expecting a left paren");

                if (token.getType() === 2 /* T_LPAREN */) {
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a left paren!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    this.parseExpression();

                    tokenInfo = this.getTokenInfo();
                    token = tokenInfo.token;
                    Compiler.Logger.logVerbose("Expecting a right paren");

                    if (token.getType() === 3 /* T_RPAREN */) {
                        this.consumeToken();
                        Compiler.Logger.logVerbose("Got a right paren!");

                        this.concreteSyntaxTree.insertLeafNode(tokenInfo);
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
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.ASSIGNMENT_STATEMENT);

            this.parseId();

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting an = ");

            if (token.getType() === 20 /* T_SINGLE_EQUALS */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a = !");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                this.parseExpression();
            } else {
                this.errorExpectedActual(20 /* T_SINGLE_EQUALS */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // VarDecl: type Id
        Parser.parseVariableDeclaration = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.VAR_DECLARATION);

            this.parseType();
            this.parseId();

            this.concreteSyntaxTree.moveToParent();
        };

        // WhileStatement: while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.WHILE_STATEMENT);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting a while");

            if (token.getType() === 9 /* T_WHILE */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a while!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                this.errorExpectedActual(9 /* T_WHILE */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // IfStatement: if BooleanExpr Block
        Parser.parseIfStatement = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.IF_STATEMENT);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting an if");

            if (token.getType() === 10 /* T_IF */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got an if!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                this.errorExpectedActual(10 /* T_IF */, token.getType());
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // Expr: IntExpr | String Expr | BooleanExpr | Id
        Parser.parseExpression = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.EXPRESSION);

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
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.INT_EXPRESSION);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting a digit");

            if (token.getType() === 11 /* T_DIGIT */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a digit!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

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
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.STRING_EXPRESSION);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting a quotation mark");

            if (token.getType() === 6 /* T_QUOTE */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a quotation mark!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                this.parseCharList();

                tokenInfo = this.getTokenInfo();
                token = tokenInfo.token;
                Compiler.Logger.logVerbose("Expecting a quotation mark");

                if (token.getType() === 6 /* T_QUOTE */) {
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a quotation mark!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);
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
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.BOOLEAN_EXPRESSION);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Potentially expecting a left paren, true, or false");

            switch (token.getType()) {
                case 2 /* T_LPAREN */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a left paren!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    this.parseExpression();
                    this.parseBooleanOperator();
                    this.parseExpression();

                    tokenInfo = this.getTokenInfo();
                    token = tokenInfo.token;
                    Compiler.Logger.logVerbose("Expecting a right paren");

                    if (token.getType() === 3 /* T_RPAREN */) {
                        this.consumeToken();
                        Compiler.Logger.logVerbose("Got a right paren!");

                        this.concreteSyntaxTree.insertLeafNode(tokenInfo);
                    } else {
                        this.errorExpectedActual(3 /* T_RPAREN */, token.getType());
                    }

                    break;

                case 25 /* T_TRUE */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a true!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    break;

                case 24 /* T_FALSE */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a false!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

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
            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting a type");

            switch (token.getType()) {
                case 17 /* T_INT */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got an int type!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    break;

                case 18 /* T_STRING */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a string type!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    break;

                case 19 /* T_BOOLEAN */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a boolean type!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    break;

                default:
                    this.errorExpectedActual(16 /* T_TYPE */, token.getType());
                    break;
            }
        };

        // Id: char
        Parser.parseId = function () {
            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Expecting an id");

            if (token.getType() === 12 /* T_ID */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got an id!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);
            } else {
                this.errorExpectedActual(12 /* T_ID */, token.getType());
            }
        };

        // CharList: char CharList | space CharList | ""
        Parser.parseCharList = function () {
            this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.CHAR_LIST);

            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Potentially expecting a string character");

            if (token.getType() === 13 /* T_CHAR */ || token.getType() === 26 /* T_WHITE_SPACE */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a string character!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                this.parseCharList();
            } else {
                // Epsilon case
            }

            this.concreteSyntaxTree.moveToParent();
        };

        // +
        Parser.parseIntOperator = function () {
            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;
            Compiler.Logger.logVerbose("Potentially expecting a plus operator");

            if (token.getType() === 14 /* T_PLUS */) {
                this.consumeToken();
                Compiler.Logger.logVerbose("Got a plus operator!");

                this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                return true;
            } else {
                return false;
            }
        };

        // == | !=
        Parser.parseBooleanOperator = function () {
            var tokenInfo = this.getTokenInfo();
            var token = tokenInfo.token;

            switch (token.getType()) {
                case 21 /* T_DOUBLE_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a double equals!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

                    break;

                case 22 /* T_NOT_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.logVerbose("Got a not equals!");

                    this.concreteSyntaxTree.insertLeafNode(tokenInfo);

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

        Parser.consumeToken = function () {
            this.currentTokenIndex++;
        };

        Parser.getTokenLineNumber = function () {
            var lineNumber = this.tokenList[this.currentTokenIndex].lineFoundOn;
            return lineNumber;
        };

        Parser.getTokenInfo = function () {
            var tokenInfo = this.tokenList[this.currentTokenIndex];
            return tokenInfo;
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
