var TSCompiler;
(function (TSCompiler) {
    var Compiler = (function () {
        function Compiler() {
        }
        Compiler.compile = function () {
            console.log("In compile()");

            // Grab the code from the code textbox
            var compileResult = false;
            var codeToCompile = document.getElementById("textboxInputCode").value;

            console.log("Compiling the following code: " + codeToCompile);

            // Pass the code to the lexer
            // TODO: Need to pass back boolean value to see if lex was successful
            var tokenList = TSCompiler.Lexer.tokenizeCode(codeToCompile);

            // Return flag if compile was successful
            return compileResult;
        };
        return Compiler;
    })();
    TSCompiler.Compiler = Compiler;
})(TSCompiler || (TSCompiler = {}));
