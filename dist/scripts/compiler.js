var Compiler;
(function (_Compiler) {
    var Compiler = (function () {
        function Compiler() {
        }
        Compiler.compile = function () {
            console.log("In compile()");

            var compileResult = false;
            var codeToCompile = document.getElementById("textboxInputCode").value;

            // Pass the code to the lexer
            // TODO: Need to pass back boolean value to see if lex was successful
            var tokenList = _Compiler.Lexer.tokenizeCode(codeToCompile);

            // TODO: Make debugging window appear that shows tokens received from lex
            // Return flag if compile was successful
            return compileResult;
        };
        return Compiler;
    })();
    _Compiler.Compiler = Compiler;
})(Compiler || (Compiler = {}));
