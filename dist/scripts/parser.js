var Compiler;
(function (Compiler) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.parseCode = function (tokenList, symbolTable) {
            this.setupParsingEnvironment(tokenList, symbolTable);

            Compiler.Logger.log("Parsing the code");
            this.parseProgram();
            Compiler.Logger.log("Parsing done");

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
            Compiler.Logger.log("Parsing Program");

            this.parseBlock();
            this.parseEOF();
        };

        // Block: { StatementList }
        Parser.parseBlock = function () {
            Compiler.Logger.log("Parsing Block");

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
                    var errorMessage = "Error! Expected a right brace, but got a " + token.getTokenName();

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }
            } else {
                var errorMessage = "Error! Expected a left brace, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // EOF: $
        Parser.parseEOF = function () {
            Compiler.Logger.log("Parsing EOF");

            var token = this.getToken();
            Compiler.Logger.log("Expecting an EOF");

            if (token.getType() === 8 /* T_EOF */) {
                this.consumeToken();
                Compiler.Logger.log("Got an EOF!");
            } else {
                Compiler.Logger.log("Error! Expected an EOF, but got a " + token.getTokenName());
            }
        };

        // StatementList: Statement StatementList | ""
        Parser.parseStatementList = function () {
            Compiler.Logger.log("Parsing StatementList");

            var token = this.getToken();

            // Check for start of statement
            if (token.getType() !== 5 /* T_RBRACE */) {
                this.parseStatement();
                this.parseStatementList();
            }
        };

        // Statemment: PrintStatement | AssignmentStatement | VarDecl | WhileStatement | IfStatement | Block
        Parser.parseStatement = function () {
            Compiler.Logger.log("Parsing Statement");

            var token = this.getToken();

            switch (token.getType()) {
                case 7 /* T_PRINT */:
                    this.parsePrintStatement();
                    break;

                case 12 /* T_ID */:
                    this.parseAssignmentStatement();
                    break;

                case 16 /* T_INT */:
                case 17 /* T_STRING */:
                case 18 /* T_BOOLEAN */:
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
                    var errorMessage = "Error! " + token.getTokenName() + " is not the beginning of any statement";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        // PrintStatement: print ( Expr )
        Parser.parsePrintStatement = function () {
            Compiler.Logger.log("Parsing PrintStatement");

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
                        var errorMessage = "Error! Expected a right paren, but got a " + token.getTokenName();

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                } else {
                    var errorMessage = "Error! Expected a left paren, but got a " + token.getTokenName();

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }
            } else {
                var errorMessage = "Error! Expected a print, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // AssignmentStatement: Id = Expr
        Parser.parseAssignmentStatement = function () {
            Compiler.Logger.log("Parsing AssignmentStatement");

            this.parseId();

            var token = this.getToken();
            Compiler.Logger.log("Expecting an = ");

            if (token.getType() === 19 /* T_SINGLE_EQUALS */) {
                this.consumeToken();
                Compiler.Logger.log("Got a = !");

                this.parseExpression();
            } else {
                var errorMessage = "Error! Expected an =, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // VarDecl: type Id
        Parser.parseVariableDeclaration = function () {
            Compiler.Logger.log("Parsing VariableDeclaration");

            this.parseType();
            this.parseId();
        };

        // WhileStatement: while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            Compiler.Logger.log("Parsing WhileStatement");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a while");

            if (token.getType() === 9 /* T_WHILE */) {
                this.consumeToken();
                Compiler.Logger.log("Got a while!");

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                var errorMessage = "Error! Expected a while, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // IfStatement: if BooleanExpr Block
        Parser.parseIfStatement = function () {
            Compiler.Logger.log("Parsing IfStatement");

            var token = this.getToken();
            Compiler.Logger.log("Expecting an if");

            if (token.getType() === 10 /* T_IF */) {
                this.consumeToken();
                Compiler.Logger.log("Got an if!");

                this.parseBooleanExpression();
                this.parseBlock();
            } else {
                var errorMessage = "Error! Expected an if, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // Expr: IntExpr | String Expr | BooleanExpr | Id
        Parser.parseExpression = function () {
            Compiler.Logger.log("Parsing Expression");

            var token = this.getToken();

            switch (token.getType()) {
                case 11 /* T_DIGIT */:
                    this.parseIntExpression();
                    break;

                case 6 /* T_QUOTE */:
                    this.parseStringExpression();
                    break;

                case 2 /* T_LPAREN */:
                case 21 /* T_NOT_EQUALS */:
                case 20 /* T_DOUBLE_EQUALS */:
                    this.parseBooleanExpression();
                    break;

                case 12 /* T_ID */:
                    this.parseId();
                    break;

                default:
                    var errorMessage = "Error! " + token.getTokenName() + " is not the beginning of any expression";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        // IntExpr: digit intop Expr | digit
        Parser.parseIntExpression = function () {
            Compiler.Logger.log("Parsing IntExpression");

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
                var errorMessage = "Error! Expected a digit, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // StringExpr: " CharList "
        Parser.parseStringExpression = function () {
            Compiler.Logger.log("Parsing StringExpression");
        };

        // BooleanExpr: ( Expr boolop Expr ) | boolval
        Parser.parseBooleanExpression = function () {
            Compiler.Logger.log("Parsing BooleanExpression");

            var token = this.getToken();

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
                        var errorMessage = "Error! Expected a right paren, but got a " + token.getTokenName();

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }

                    break;

                case 23 /* T_TRUE */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a true!");

                    break;

                case 22 /* T_FALSE */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a false!");

                    break;

                default:
                    var errorMessage = "Error! " + token.getTokenName() + " is not the beginning of any boolean expression";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        // int | string | boolean
        Parser.parseType = function () {
            Compiler.Logger.log("Parsing Type");

            var token = this.getToken();
            Compiler.Logger.log("Expecting a type");

            switch (token.getType()) {
                case 16 /* T_INT */:
                    this.consumeToken();
                    Compiler.Logger.log("Got an int type!");

                    break;

                case 17 /* T_STRING */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a string type!");

                    break;

                case 18 /* T_BOOLEAN */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a boolean type!");

                    break;

                default:
                    var errorMessage = "Error! Expected a type, but got a " + token.getTokenName();

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        // Id: char
        Parser.parseId = function () {
            Compiler.Logger.log("Parsing Id");

            var token = this.getToken();
            Compiler.Logger.log("Expecting an id");

            if (token.getType() === 12 /* T_ID */) {
                this.consumeToken();
                Compiler.Logger.log("Got an id!");
            } else {
                var errorMessage = "Error! Expected an id, but got a " + token.getTokenName();

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        // CharList: char CharList | space CharList | ""
        Parser.parseCharList = function () {
            Compiler.Logger.log("Parsing CharList");
        };

        Parser.parseIntOperator = function () {
            Compiler.Logger.log("Parsing IntOperator");

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

        Parser.parseBooleanOperator = function () {
            Compiler.Logger.log("Parsing BooleanOperator");

            var token = this.getToken();

            switch (token.getType()) {
                case 20 /* T_DOUBLE_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a double equals!");

                    break;

                case 21 /* T_NOT_EQUALS */:
                    this.consumeToken();
                    Compiler.Logger.log("Got a not equals!");

                    break;

                default:
                    var errorMessage = "Error! " + token.getTokenName() + " is not a valid boolean operator.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;

                    break;
            }
        };

        Parser.getToken = function () {
            var token = this.tokenList[this.currentTokenIndex];

            Compiler.Logger.log("Current token: " + token.getTokenName());
            return this.tokenList[this.currentTokenIndex];
        };

        Parser.consumeToken = function () {
            this.currentTokenIndex++;
        };
        return Parser;
    })();
    Compiler.Parser = Parser;
})(Compiler || (Compiler = {}));
