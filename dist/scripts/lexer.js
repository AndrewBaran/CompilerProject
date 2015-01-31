var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode) {
            // TODO: Maybe move to another unit?
            this.setupRegexPatterns();

            console.log("In tokenizeCode()");
            Compiler.Logger.log("Performing lexical analysis");

            var tokenList = [];

            var currentChar = "";
            var currentIndex = 0;
            var currentWord = "";

            while (inputCode.length > 0 && (currentChar = inputCode[currentIndex]) != "$") {
                console.log("Found char: " + currentChar);
                currentIndex++;

                // Not whitespace
                if (!(/\s/.test(currentChar))) {
                    console.log("Current word: " + currentWord);
                    currentWord += currentChar;
                } else {
                    var token = new Compiler.Token("", currentWord);
                    tokenList.push(token);
                    currentWord = "";

                    Compiler.Logger.log("Found lexeme: " + token.value);
                }
            }

            return tokenList;
        };

        // TODO: Refactor regex patterns to dynamically load from a (global) array containing all of this
        // Set up patterns that will match tokens
        Lexer.setupRegexPatterns = function () {
            // Prevent repeats of the same regexs
            this.tokenPatterns = [];

            // TODO: THIS IS PROBABLY NOT HOW YOU DO THIS
            // Add each regex and associated token
            this.tokenPatterns.push(/while/);
            this.tokenPatterns.push(/if/);
            this.tokenPatterns.push(/\(/);
            this.tokenPatterns.push(/\)/);
            this.tokenPatterns.push(/\{/);
            this.tokenPatterns.push(/\}/);
            this.tokenPatterns.push(/int/);
            this.tokenPatterns.push(/string/);
            this.tokenPatterns.push(/boolean/);
            this.tokenPatterns.push(/[a-z]/);
            this.tokenPatterns.push(/[0-9]/);
            this.tokenPatterns.push(/\+/);
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;
})(Compiler || (Compiler = {}));
