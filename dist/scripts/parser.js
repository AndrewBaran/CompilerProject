var Compiler;
(function (Compiler) {
    // TODO: Add line where token was found
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
            this.parseBlock();
            this.parseEOF();
        };

        // Block: { StatementList }
        Parser.parseBlock = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a left brace");

            if (token.getType() === 4 /* T_LBRACE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a left brace!");

                this.parseStatementList();

                token = this.getToken();
                Compiler.Logger.log("Expecting a right brace!");

                if (token.getType() === 5 /* T_RBRACE */) {
                    this.consumeToken();
                    Compiler.Logger.log("Got a right brace!");
                } else {
                    this.errorExpectedActual(5 /* T_RBRACE */, token.getType());
                }
            } else {
                this.errorExpectedActual(4 /* T_LBRACE */, token.getType());
            }
        };

        // EOF: $
        Parser.parseEOF = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting an EOF");

            if (token.getType() === 8 /* T_EOF */) {
                this.consumeToken();
                Compiler.Logger.log("Got an EOF!");
            } else {
                this.errorExpectedActual(8 /* T_EOF */, token.getType());
            }
        };

        // StatementList: Statement StatementList | ""
        Parser.parseStatementList = function () {
            var token = this.getToken();

            // Check for start of statement
            if (token.getType() !== 5 /* T_RBRACE */) {
                this.parseStatement();
                this.parseStatementList();
            }
        };

        // Statemment: PrintStatement | AssignmentStatement | VarDecl | WhileStatement | IfStatement | Block
        Parser.parseStatement = function () {
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
        };

        // PrintStatement: print ( Expr )
        Parser.parsePrintStatement = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a print");

            if (token.getType() === 7 /* T_PRINT */) {
                this.consumeToken();
                Compiler.Logger.log("Got a print!");

                token = this.getToken();
                Compiler.Logger.log("Expecting a left paren");

                if (token.getType() === 2 /* T_LPAREN */) {
                    this.consumeToken();
                    Compiler.Logger.log("Got a left paren!");

                    this.parseExpression();

                    token = this.getToken();
                    Compiler.Logger.log("Expecting a right paren");

                    if (token.getType() === 3 /* T_RPAREN */) {
                        this.consumeToken();
                        Compiler.Logger.log("Got a right paren!");
                    } else {
                        this.errorExpectedActual(3 /* T_RPAREN */, token.getType());
                    }
                } else {
                    this.errorExpectedActual(2 /* T_LPAREN */, token.getType());
                }
            } else {
                this.errorExpectedActual(7 /* T_PRINT */, token.getType());
            }
        };

        // AssignmentStatement: Id = Expr
        Parser.parseAssignmentStatement = function () {
            this.parseId();

            var token = this.getToken();
            Compiler.Logger.log("Expecting an = ");

            if (token.getType() === 20 /* T_SINGLE_EQUALS */) {
                this.consumeToken();
                Compiler.Logger.log("Got a = !");

                this.parseExpression();
            } else {
                this.errorExpectedActual(20 /* T_SINGLE_EQUALS */, token.getType());
            }
        };

        // VarDecl: type Id
        Parser.parseVariableDeclaration = function () {
            this.parseType();
            this.parseId();
        };

        // WhileStatement: while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a while");

            if (token.getType() === 9 /* T_WHILE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a while!");

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                this.errorExpectedActual(9 /* T_WHILE */, token.getType());
            }
        };

        // IfStatement: if BooleanExpr Block
        Parser.parseIfStatement = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting an if");

            if (token.getType() === 10 /* T_IF */) {
                this.consumeToken();
                Compiler.Logger.log("Got an if!");

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                this.errorExpectedActual(10 /* T_IF */, token.getType());
            }
        };

        // Expr: IntExpr | String Expr | BooleanExpr | Id
        Parser.parseExpression = function () {
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
        };

        // IntExpr: digit intop Expr | digit
        Parser.parseIntExpression = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a digit");

            if (token.getType() === 11 /* T_DIGIT */) {
                this.consumeToken();
                Compiler.Logger.log("Got a digit!");

                var intOpExisted = this.parseIntOperator();

                if (intOpExisted) {
                    this.parseExpression();
                }
            } else {
                this.errorExpectedActual(11 /* T_DIGIT */, token.getType());
            }
        };

        // StringExpr: " CharList "
        Parser.parseStringExpression = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a quotation mark");

            if (token.getType() === 6 /* T_QUOTE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a quotation mark!");

                this.parseCharList();

                token = this.getToken();
                Compiler.Logger.log("Expecting a quotation mark");

                if (token.getType() === 6 /* T_QUOTE */) {
                    this.consumeToken();
                    Compiler.Logger.log("Got a quotation mark!");
                } else {
                    this.errorExpectedActual(6 /* T_QUOTE */, token.getType());
                }
            } else {
                this.errorExpectedActual(6 /* T_QUOTE */, token.getType());
            }
        };

        // BooleanExpr: ( Expr boolop Expr ) | boolval
        Parser.parseBooleanExpression = function () {
            var token = this.getToken();
            Compiler.Logger.log("Potentially expecting a left paren, true, or false");

            switch (token.getType()) {
                case 2 /* T_LPAREN */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a left paren!");

                    this.parseExpression();
                    this.parseBooleanOperator();
                    this.parseExpression();

                    token = this.getToken();
                    Compiler.Logger.log("Expecting a right paren");

                    if (token.getType() === 3 /* T_RPAREN */) {
                        this.consumeToken();
                        Compiler.Logger.log("Got a right paren!");
                    } else {
                        this.errorExpectedActual(3 /* T_RPAREN */, token.getType());
                    }

                    break;

                case 25 /* T_TRUE */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a true!");

                    break;

                case 24 /* T_FALSE */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a false!");

                    break;

                default:
                    var errorMessage = "Error on line " + token.getTokenName() + ": " + token.getTokenName() + " is not the beginning of any boolean expression";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        // int | string | boolean
        Parser.parseType = function () {
            var token = this.getToken();
            Compiler.Logger.log("Expecting a type");

            switch (token.getType()) {
                case 17 /* T_INT */:
                    this.consumeToken();
                    Compiler.Logger.log("Got an int type!");

                    break;

                case 18 /* T_STRING */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a string type!");

                    break;

                case 19 /* T_BOOLEAN */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a boolean type!");

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
            } else {
                this.errorExpectedActual(12 /* T_ID */, token.getType());
            }
        };

        // CharList: char CharList | space CharList | ""
        Parser.parseCharList = function () {
            var token = this.getToken();
            Compiler.Logger.log("Potentially expecting a string character");

            if (token.getType() === 13 /* T_CHAR */ || token.getType() === 26 /* T_WHITE_SPACE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a string character!");

                this.parseCharList();
            }
        };

        // +
        Parser.parseIntOperator = function () {
            var token = this.getToken();
            Compiler.Logger.log("Potentially expecting a plus operator");

            if (token.getType() === 14 /* T_PLUS */) {
                this.consumeToken();
                Compiler.Logger.log("Got a plus operator!");

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

                    break;

                case 22 /* T_NOT_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a not equals!");

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

        Parser.errorExpectedActual = function (expectedType, actualType) {
            var errorMessage = "Error on line " + this.getTokenLineNumber() + ": Expected " + TokenType[expectedType] + ", but got " + TokenType[actualType];

            Compiler.Logger.log(errorMessage);
            throw errorMessage;
        };
        return Parser;
    })();
    Compiler.Parser = Parser;
})(Compiler || (Compiler = {}));
