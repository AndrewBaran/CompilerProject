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
                    Compiler.Logger.log("Error! Expected a right brace, but got a " + token.getTokenName());
                }
            } else {
                Compiler.Logger.log("Error! Expected a left brace, but got a " + token.getTokenName());
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

                case 15 /* T_INT */:
                case 16 /* T_STRING */:
                case 17 /* T_BOOLEAN */:
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

            if (token.getType() === 18 /* T_SINGLE_EQUALS */) {
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
        };

        // WhileStatement: while BooleanExpr Block
        Parser.parseWhileStatement = function () {
            Compiler.Logger.log("Parsing WhileStatement");
        };

        // IfStatement: if BooleanExpr Block
        Parser.parseIfStatement = function () {
            Compiler.Logger.log("Parsing IfStatement");
        };

        // Expr: IntExpr | String Expr | BooleanExpr | Id
        Parser.parseExpression = function () {
            Compiler.Logger.log("Parsing Expression");

            // TODO: Debugging for now
            this.consumeToken();
        };

        // IntExpr: digit intop Expr | digit
        Parser.parseIntExpression = function () {
            Compiler.Logger.log("Parsing IntExpression");
        };

        // StringExpr: " CharList "
        Parser.parseStringExpression = function () {
            Compiler.Logger.log("Parsing StringExpression");
        };

        // BooleanExpr: ( Expr boolop Expr ) | boolval
        Parser.parseBooleanExpression = function () {
            Compiler.Logger.log("Parsing BooleanExpression");
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

        Parser.getToken = function () {
            return this.tokenList[this.currentTokenIndex];
        };

        Parser.consumeToken = function () {
            this.currentTokenIndex++;
        };
        return Parser;
    })();
    Compiler.Parser = Parser;
})(Compiler || (Compiler = {}));
