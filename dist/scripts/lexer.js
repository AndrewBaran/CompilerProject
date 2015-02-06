var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode) {
            // TODO: Maybe move to another unit?
            this.setupRegexPatterns();

            Compiler.Logger.log("Performing lexical analysis");

            var tokenList = [];
            var currentToken = null;

            var currentChar = "";
            var currentWord = "";

            var currentIndex = 0;

            while (currentIndex != inputCode.length) {
                currentChar = inputCode[currentIndex];
                currentIndex++;

                Compiler.Logger.log("Char: " + currentChar);

                var patternMatched = false;

                // See if currentChar is whitespace
                if (/\s/.test(currentChar)) {
                    Compiler.Logger.log("Found a whitespace.");

                    // See if currentToken is null
                    if (currentToken == null) {
                        currentToken = new Compiler.Token(21 /* T_WHITE_SPACE */, "");
                        Compiler.Logger.log("Creating token of type whitespace");
                    } else {
                        Compiler.Logger.log("Current token: " + currentToken.type);
                        Compiler.Logger.log("Adding it to the stream");

                        tokenList.push(currentToken);

                        // Reset tokens
                        currentToken = new Compiler.Token(21 /* T_WHITE_SPACE */, "");
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
                    var tokenRegex = this.tokenPatterns[i].regex;
                    var tokenType = this.tokenPatterns[i].type;

                    // Regex passed
                    if (tokenRegex.test(currentWord)) {
                        patternMatched = true;

                        // TODO: If token, like int or string, then look for more matches
                        Compiler.Logger.log(currentWord + " matched the regex " + tokenRegex);

                        // Enum is treated as array, so index it with enum type to get name of token
                        Compiler.Logger.log("Token matched: " + TokenType[tokenType]);

                        currentToken = new Compiler.Token(tokenType, "");
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
            this.tokenPatterns = [
                { regex: /while/, type: 7 /* T_WHILE */ },
                { regex: /if/, type: 8 /* T_IF */ },
                { regex: /\(/, type: 0 /* T_LPAREN */ },
                { regex: /\)/, type: 0 /* T_LPAREN */ },
                { regex: /\{/, type: 2 /* T_LBRACE */ },
                { regex: /\}/, type: 3 /* T_RBRACE */ },
                { regex: /"/, type: 4 /* T_QUOTE */ },
                { regex: /int/, type: 13 /* T_INT */ },
                { regex: /string/, type: 14 /* T_STRING */ },
                { regex: /boolean/, type: 15 /* T_BOOLEAN */ },
                { regex: /print/, type: 5 /* T_PRINT */ },
                { regex: /[a-z]/, type: 10 /* T_CHAR */ },
                { regex: /[0-9]/, type: 9 /* T_DIGIT */ },
                { regex: /\+/, type: 11 /* T_PLUS */ },
                { regex: /\$/, type: 6 /* T_EOF */ },
                { regex: /=/, type: 16 /* T_SINGLE_EQUALS */ },
                { regex: /==/, type: 17 /* T_DOUBLE_EQUALS */ },
                { regex: /!=/, type: 18 /* T_NOT_EQUALS */ },
                { regex: /true/, type: 20 /* T_TRUE */ },
                { regex: /false/, type: 19 /* T_FALSE */ },
                { regex: /\s+/, type: 21 /* T_WHITE_SPACE */ }
            ];
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;
})(Compiler || (Compiler = {}));
