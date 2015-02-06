var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode) {
            // TODO: Maybe move to another unit?
            this.setupRegexPatterns();

            // TODO Incorporate this into setupRegexPatterns
            var whitespaceRegex = /\s+/g;

            Compiler.Logger.log("Performing lexical analysis");

            var tokenList = [];
            var currentToken = null;

            var currentChar = "";
            var currentIndex = 0;
            var currentWord = "";

            while (currentIndex != inputCode.length) {
                currentChar = inputCode[currentIndex];
                currentIndex++;

                Compiler.Logger.log("Found char: " + currentChar);

                var patternMatched = false;

                // See if currentChar is whitespace
                if (whitespaceRegex.test(currentChar)) {
                    Compiler.Logger.log("Found a whitespace.");

                    // See if currentToken is null
                    if (currentToken == null) {
                        currentToken = new Compiler.Token(21 /* T_WHITE_SPACE */, "b");

                        Compiler.Logger.log("Creating token of type whitespace");
                    } else {
                        Compiler.Logger.log("Current token: " + currentToken.type);
                        Compiler.Logger.log("Adding it to the stream");

                        tokenList.push(currentToken);

                        // Reset tokens
                        currentToken = new Compiler.Token(21 /* T_WHITE_SPACE */, "b");
                        currentWord = "";
                    }
                } else if (currentToken != null && currentToken.type == 21 /* T_WHITE_SPACE */) {
                    Compiler.Logger.log("Found nonwhite space after whitespace tokens. Rejecting this whitespace token.");

                    // Reset token
                    currentToken = null;
                    currentWord = "";
                }

                currentWord += currentChar;

                for (var i = 0; i < this.tokenPatterns.length && !patternMatched; i++) {
                    var regex = this.tokenPatterns[i];

                    // Passed regex
                    if (regex.test(currentWord)) {
                        patternMatched = true;

                        // If token, like int or string, then look for more matches
                        Compiler.Logger.log(currentWord + " matched a word.");
                        Compiler.Logger.log("Regex that matched it: " + regex);

                        // TODO Test values
                        currentToken = new Compiler.Token(1, "b");
                    }
                }

                if (!patternMatched) {
                    Compiler.Logger.log("No patterns matched.");
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
            this.tokenPatterns.push(/\$/);
            this.tokenPatterns.push(/==/);
            this.tokenPatterns.push(/!=/);
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;
})(Compiler || (Compiler = {}));
