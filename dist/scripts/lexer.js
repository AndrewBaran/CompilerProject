var TSCompiler;
(function (TSCompiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode) {
            console.log("In tokenizeCode()");
            TSCompiler.Logger.write("Performing lexical analysis");

            var tokenList = [];

            return tokenList;
        };
        return Lexer;
    })();
    TSCompiler.Lexer = Lexer;
})(TSCompiler || (TSCompiler = {}));
