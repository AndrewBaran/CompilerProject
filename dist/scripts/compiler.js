var Compiler;
(function (_Compiler) {
    var Compiler = (function () {
        function Compiler() {
        }
        Compiler.compile = function (codeToCompile) {
            var lexResult = false;
            var parseResult = false;
            var semanticResult = false;
            var codeGenResult = false;

            var tokenList = [];
            var symbolTable = new _Compiler.SymbolTable();
            var concreteSyntaxTree = new _Compiler.ConcreteSyntaxTree();
            var abstractSyntaxTree = new _Compiler.AbstractSyntaxTree();

            if (codeToCompile.length == 0) {
                _Compiler.Logger.log("Error! No code available to compile.");
            } else {
                try  {
                    tokenList = _Compiler.Lexer.tokenizeCode(codeToCompile);
                    lexResult = true;
                } catch (exception) {
                    lexResult = false;
                }
            }

            if (tokenList.length > 0 && lexResult) {
                if (!this.testMode) {
                    _Compiler.Control.displayTokenTable(tokenList);
                }

                try  {
                    concreteSyntaxTree = _Compiler.Parser.parseCode(tokenList);
                    parseResult = true;
                } catch (exception) {
                    parseResult = false;
                }
            }

            if (parseResult) {
                if (!this.testMode) {
                    _Compiler.Control.displayCST(concreteSyntaxTree);
                }

                try  {
                    abstractSyntaxTree = _Compiler.SemanticAnalyzer.analyze(concreteSyntaxTree, symbolTable);
                    semanticResult = true;
                } catch (exception) {
                    semanticResult = false;
                }
            }

            if (semanticResult) {
                if (!this.testMode) {
                    _Compiler.Control.displaySymbolTable(symbolTable);
                }

                try  {
                    var codeList = _Compiler.CodeGenerator.generateCode(abstractSyntaxTree);
                    codeGenResult = true;
                } catch (exception) {
                    codeGenResult = false;
                }
            }

            if (codeGenResult) {
                _Compiler.Control.displayCodeGen(codeList);
            }

            _Compiler.Control.displayCompilerResults(lexResult, parseResult, semanticResult, codeGenResult);

            return lexResult && parseResult && semanticResult && codeGenResult;
        };

        Compiler.setTestMode = function (isTestMode) {
            this.testMode = isTestMode;
        };
        return Compiler;
    })();
    _Compiler.Compiler = Compiler;

    // Structs
    var TokenInfo = (function () {
        function TokenInfo() {
        }
        return TokenInfo;
    })();
    _Compiler.TokenInfo = TokenInfo;
})(Compiler || (Compiler = {}));
