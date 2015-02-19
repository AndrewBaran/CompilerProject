var Compiler;
(function (_Compiler) {
    var Compiler = (function () {
        function Compiler() {
        }
        Compiler.compile = function (codeToCompile) {
            this.symbolTable = new _Compiler.SymbolTable();
            this.setCompilerFlags();

            var lexResult = false;
            var parseResult = false;

            var tokenList = [];
            var concreteSyntaxTree = null;

            // No available code to lex
            if (codeToCompile.length == 0) {
                _Compiler.Logger.log("Error! No code present to compile");
            } else {
                try  {
                    tokenList = _Compiler.Lexer.tokenizeCode(codeToCompile, this.symbolTable);
                    lexResult = true;
                } catch (exception) {
                    lexResult = false;
                }
            }

            if (tokenList.length > 0 && lexResult) {
                if (!this.testMode) {
                    if (this.debugMode) {
                        _Compiler.Control.debugCreateTokenDiv(tokenList);
                    }

                    _Compiler.Control.debugCreateSymbolTableDiv(this.symbolTable);
                }

                try  {
                    concreteSyntaxTree = _Compiler.Parser.parseCode(tokenList, this.symbolTable);
                    parseResult = true;
                } catch (exception) {
                    parseResult = false;
                }
            }

            if (parseResult) {
                // TOOD: Semantic analysis
            }

            if (!this.testMode) {
                _Compiler.Control.displayCompilerResults(lexResult, parseResult);
            }

            // TODO: Return the AND of each compilation result
            return lexResult && parseResult;
        };

        // Set flags for use by the compiler (debug mode, etc.)
        Compiler.setCompilerFlags = function () {
            var checkboxDebug = document.getElementById("checkboxDebug");
            this.debugMode = checkboxDebug.checked;

            if (this.debugMode) {
                _Compiler.Logger.log("Debug mode enabled");
                _Compiler.Logger.log("");
            }
        };

        Compiler.setTestMode = function (isTestMode) {
            this.testMode = isTestMode;
        };
        return Compiler;
    })();
    _Compiler.Compiler = Compiler;

    // TODO: Move to another file?
    var TokenInfo = (function () {
        function TokenInfo() {
        }
        return TokenInfo;
    })();
    _Compiler.TokenInfo = TokenInfo;
})(Compiler || (Compiler = {}));
