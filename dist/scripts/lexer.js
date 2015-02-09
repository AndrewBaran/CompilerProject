var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode, symbolTable) {
            this.setupTokenPatterns();

            Compiler.Logger.log("Performing lexical analysis");

            var tokenList = [];
            var currentToken = new Compiler.Token();

            var currentChar = "";
            var currentWord = "";

            var currentIndex = 0;

            var currentLine = 1;
            var eofFound = false;

            while (currentIndex != inputCode.length && !eofFound) {
                currentChar = inputCode[currentIndex];
                currentIndex++;

                Compiler.Logger.log("Char: \"" + currentChar + "\"");
                currentWord += currentChar;

                // Update counter for error reporting
                if (currentChar === "\n") {
                    currentLine++;
                }

                var tokenMatched = this.matchesTokenPattern(currentWord);

                if (tokenMatched.token.type !== 0 /* T_NO_MATCH */) {
                    currentToken = tokenMatched.token;
                }

                Compiler.Logger.log("Current = " + TokenType[currentToken.type]);

                if (tokenMatched.isMatch) {
                    Compiler.Logger.log("Token matched was: " + TokenType[currentToken.type]);
                } else {
                    // Didn't match a pattern
                    if (symbolTable.hasReservedWordPrefix(currentWord)) {
                        Compiler.Logger.log(currentWord + " is a prefix of a reserved word.");
                    } else {
                        if (currentToken.type !== 1 /* T_DEFAULT */) {
                            Compiler.Logger.log("Adding to token stream and reseting words.");

                            tokenList.push(currentToken);

                            currentWord = "";
                            currentToken = new Compiler.Token();

                            // Back up and re-lex the same character
                            currentIndex--;
                        } else {
                            var errorMessage = "Error on line " + currentLine + ": " + currentWord + " is a not valid lexeme.";

                            Compiler.Logger.log(errorMessage);
                            throw errorMessage;
                        }
                    }
                }
            }

            // Extract last token
            if (currentToken.type !== 1 /* T_DEFAULT */) {
                tokenList.push(currentToken);
            }

            // TODO: Routine to check for input beyond the EOF
            return tokenList;
        };

        // Looks for a regex match for the word, and if it does, produces a token of the type to be returned
        // in the currentToken formal parameter
        Lexer.matchesTokenPattern = function (currentWord) {
            var returnTokenMatch = new TokenMatch();
            var patternMatched = false;

            for (var i = 0; i < this.tokenPatterns.length && !patternMatched; i++) {
                var tokenRegex = this.tokenPatterns[i].regex;
                var tokenType = this.tokenPatterns[i].type;

                // Regex passed
                if (tokenRegex.test(currentWord)) {
                    patternMatched = true;

                    Compiler.Logger.log(currentWord + " matched the regex " + tokenRegex);

                    // Enum is treated as array, so index it with enum type to get name of token
                    Compiler.Logger.log("Token matched: " + TokenType[tokenType]);

                    var currentToken = new Compiler.Token();
                    currentToken.type = tokenType;

                    returnTokenMatch.token = currentToken;
                }
            }

            returnTokenMatch.isMatch = patternMatched;
            return returnTokenMatch;
        };

        Lexer.setupTokenPatterns = function () {
            this.tokenPatterns = [
                { regex: /^while$/g, type: 9 /* T_WHILE */ },
                { regex: /^if$/g, type: 10 /* T_IF */ },
                { regex: /^true$/g, type: 22 /* T_TRUE */ },
                { regex: /^false$/g, type: 21 /* T_FALSE */ },
                { regex: /^int$/g, type: 15 /* T_INT */ },
                { regex: /^string$/g, type: 16 /* T_STRING */ },
                { regex: /^boolean$/g, type: 17 /* T_BOOLEAN */ },
                { regex: /^print$/g, type: 7 /* T_PRINT */ },
                { regex: /^\($/g, type: 2 /* T_LPAREN */ },
                { regex: /^\)$/g, type: 2 /* T_LPAREN */ },
                { regex: /^\{$/g, type: 4 /* T_LBRACE */ },
                { regex: /^\}$/g, type: 5 /* T_RBRACE */ },
                { regex: /^"$/g, type: 6 /* T_QUOTE */ },
                { regex: /^[a-z]$/g, type: 12 /* T_ID */ },
                { regex: /^[0-9]$/g, type: 11 /* T_DIGIT */ },
                { regex: /^\+$/g, type: 13 /* T_PLUS */ },
                { regex: /^\$$/g, type: 8 /* T_EOF */ },
                { regex: /^=$/g, type: 18 /* T_SINGLE_EQUALS */ },
                { regex: /^==$/g, type: 19 /* T_DOUBLE_EQUALS */ },
                { regex: /^!=$/g, type: 20 /* T_NOT_EQUALS */ },
                { regex: /^[\s|\n]+$/g, type: 23 /* T_WHITE_SPACE */ }
            ];
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;

    var TokenMatch = (function () {
        function TokenMatch() {
            this.token = new Compiler.Token();
            this.token.type = 0 /* T_NO_MATCH */;
            this.isMatch = false;
        }
        return TokenMatch;
    })();
    Compiler.TokenMatch = TokenMatch;
})(Compiler || (Compiler = {}));
