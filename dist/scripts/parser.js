var Compiler;
(function (Compiler) {
    var Parser = (function () {
        function Parser() {
        }
        Parser.parseCode = function (tokenList, symbolTable) {
            Compiler.Logger.log("Parsing the code");

            this.setupParsingEnvironment(tokenList, symbolTable);

            this.parseProgram();
        };

        Parser.setupParsingEnvironment = function (tokenList, symbolTable) {
            this.tokenList = tokenList;
            this.symbolTable = symbolTable;

            this.currentTokenIndex = 0;
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
                    Compiler.Logger.log("Got a right brace");

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
