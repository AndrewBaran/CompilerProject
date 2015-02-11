var Compiler;
(function (_Compiler) {
    var Compiler = (function () {
        function Compiler() {
        }
        Compiler.compile = function (codeToCompile) {
            this.symbolTable = new _Compiler.SymbolTable();
            this.setCompilerFlags();

            var lexResult = true;
            var parseResult = true;
            var compileResult = true;

            var tokenList = [];
            var concreteSyntaxTree = null;

            // No available code to lex
            if (codeToCompile.length == 0) {
                _Compiler.Logger.log("Error! No code present to compile");
            } else {
                try  {
                    tokenList = _Compiler.Lexer.tokenizeCode(codeToCompile, this.symbolTable);
                } catch (exception) {
                    lexResult = false;
                }
            }

            if (tokenList.length > 0 && lexResult) {
                if (this.debugMode) {
                    _Compiler.Control.debugCreateTokenDiv(tokenList);
                    _Compiler.Control.debugCreateSymbolTableDiv(this.symbolTable);
                }

                if (this.parseMode) {
                    try  {
                        concreteSyntaxTree = _Compiler.Parser.parseCode(tokenList, this.symbolTable);
                    } catch (exception) {
                        parseResult = false;
                    }
                }
            }

            if (parseResult) {
                // TOOD: Semantic analysis
            }

            return compileResult;
        };

        // Set flags for use by the compiler (debug mode, etc.)
        Compiler.setCompilerFlags = function () {
            var checkboxDebug = document.getElementById("checkboxDebug");
            this.debugMode = checkboxDebug.checked;

            if (this.debugMode) {
                _Compiler.Logger.log("Debug mode enabled");
            }

            var checkboxParse = document.getElementById("checkboxParse");
            this.parseMode = checkboxParse.checked;
        };
        return Compiler;
    })();
    _Compiler.Compiler = Compiler;
})(Compiler || (Compiler = {}));
