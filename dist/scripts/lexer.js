var TSCompiler;
(function (TSCompiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        // TODO: Want to return a list of Token types
        Lexer.tokenizeCode = function (inputCode) {
            console.log("In tokenizeCode()");
            TSCompiler.Logger.write("Beginning to perform lexical analysis.");

            return [];
        };
        return Lexer;
    })();
    TSCompiler.Lexer = Lexer;
})(TSCompiler || (TSCompiler = {}));
