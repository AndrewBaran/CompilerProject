var TSCompiler;
(function (TSCompiler) {
    var Compiler = (function () {
        function Compiler() {
        }
        Compiler.compile = function () {
            console.log("In compile()");

            // Grab the code from the code textbox
            var codeToCompile = document.getElementById("textboxInputCode").value;

            console.log("Compiling the following code: " + codeToCompile);

            // Pass the code to the lexer
            TSCompiler.Lexer.tokenizeCode(codeToCompile);
        };
        return Compiler;
    })();
    TSCompiler.Compiler = Compiler;
})(TSCompiler || (TSCompiler = {}));
