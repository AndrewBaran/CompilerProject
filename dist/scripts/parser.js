var Compiler;
(function (Compiler) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.parseCode = function (tokenList, symbolTable) {
            Compiler.Logger.log("Parsing the code");

            this.setupParsingEnvironment(tokenList, symbolTable);

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

        Parser.parseProgram = function () {
            this.parseBlock();
            this.parseEOF();
        };

        Parser.parseBlock = function () {
            Compiler.Logger.log("Expecting a left brace");

            var token = this.getToken();

            if (token.type === 4 /* T_LBRACE */) {
                Compiler.Logger.log("Got a left brace!");

                this.consumeToken();
                this.parseStatementList();

                token = this.getToken();

                Compiler.Logger.log("Expecting a right brace!");

                if (token.type === 5 /* T_RBRACE */) {
                    Compiler.Logger.log("Got a right brace!");

                    this.consumeToken();
                } else {
                    Compiler.Logger.log("Error! Expected a right brace, but got a " + token.getTokenName());
                }
            } else {
                Compiler.Logger.log("Error! Expected a left brace, but got a " + token.getTokenName());
            }
        };

        Parser.parseEOF = function () {
            Compiler.Logger.log("Expecting an EOF");

            var token = this.getToken();

            if (token.type === 8 /* T_EOF */) {
                Compiler.Logger.log("Got an EOF!");

                this.consumeToken();
            } else {
                Compiler.Logger.log("Error! Expected an EOF, but got a " + token.getTokenName());
            }
        };

        Parser.parseStatementList = function () {
            var token = this.getToken();

            // Check for start of statement
            if (token.type !== 5 /* T_RBRACE */) {
                this.parseStatement();
                this.parseStatementList();
            }
        };

        Parser.parseStatement = function () {
            var token = this.getToken();

            switch (token.type) {
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
                    Compiler.Logger.log("Error!");
                    throw "Error!";
                    break;
            }
        };

        Parser.parsePrintStatement = function () {
            var token = this.getToken();

            Compiler.Logger.log("Expecting a print");

            if (token.type === 7 /* T_PRINT */) {
                Compiler.Logger.log("Got a print!");

                this.consumeToken();

                token = this.getToken();

                Compiler.Logger.log("Expecting a left paren");

                if (token.type === 2 /* T_LPAREN */) {
                    Compiler.Logger.log("Got a left paren!");

                    this.consumeToken();

                    this.parseExpression();

                    token = this.getToken();

                    Compiler.Logger.log("Expecting a right paren");

                    if (token.type === 3 /* T_RPAREN */) {
                        Compiler.Logger.log("Got a right paren!");

                        this.consumeToken();
                    } else {
                        Compiler.Logger.log("Expecting a right paren but got a " + token.getTokenName());
                        throw "Error!";
                    }
                } else {
                    Compiler.Logger.log("Expected a left paren but got a " + token.getTokenName());
                    throw "Error!";
                }
            } else {
                Compiler.Logger.log("Expected a print but got a " + token.getTokenName());
                throw "Error!";
            }
        };

        Parser.parseAssignmentStatement = function () {
        };

        Parser.parseVariableDeclaration = function () {
        };

        Parser.parseWhileStatement = function () {
        };

        Parser.parseIfStatement = function () {
        };

        Parser.parseExpression = function () {
            // TODO: Debug mode
            this.consumeToken();
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
