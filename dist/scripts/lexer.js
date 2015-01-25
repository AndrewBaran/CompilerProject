var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode) {
            console.log("In tokenizeCode()");
            Compiler.Logger.write("Performing lexical analysis");

            var tokenList = [];

            // TODO: Actually lex the code
            return tokenList;
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;
})(Compiler || (Compiler = {}));
