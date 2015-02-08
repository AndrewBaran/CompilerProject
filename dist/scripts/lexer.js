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
            var currentToken = null;

            var currentChar = "";
            var currentWord = "";

            var currentIndex = 0;

            while (currentIndex != inputCode.length) {
                currentChar = inputCode[currentIndex];
                currentIndex++;

                Compiler.Logger.log("Char: " + currentChar);

                var patternMatched = false;

                // If currentChar is a token delimiter (whitespace, ( ) { } = " ! + etc)
                //		If whitespace token, do other stuff (TODO)
                //			Act like whitespace is one big token, continue lexing
                //		Else
                //			Submit token to stream
                //			Reset token
                // Add currentChar to the word
                // Test the word against all regexes
                //		If no matches, check for match against prefix of reserved word
                //			If reserved word, continue lexing
                //			If not, then error out
                // Take the longest currently matching regex
                // See if currentChar is whitespace
                if (/\s/.test(currentChar)) {
                    Compiler.Logger.log("Found a whitespace.");

                    // See if currentToken is null
                    if (currentToken == null) {
                        currentToken = new Compiler.Token(21 /* T_WHITE_SPACE */, "");
                        Compiler.Logger.log("Creating token of type whitespace");
                    } else {
                        Compiler.Logger.log("Current token: " + TokenType[currentToken.type]);
                        Compiler.Logger.log("Adding it to the stream");

                        tokenList.push(currentToken);

                        // Reset tokens
                        currentToken = new Compiler.Token(21 /* T_WHITE_SPACE */, "");
                        currentWord = "";
                    }
                } else if (currentToken != null && currentToken.type == 21 /* T_WHITE_SPACE */) {
                    Compiler.Logger.log("Non-whitespace found.");
                    Compiler.Logger.log("Discarding current token: " + TokenType[currentToken.type]);

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
                    if (symbolTable.hasReservedWordPrefix(currentWord)) {
                        Compiler.Logger.log(currentWord + " is a prefix of a reserved word. Continue lexing.");
                    }
                }
            }

            return tokenList;
        };

        Lexer.setupTokenPatterns = function () {
            this.tokenPatterns = [
                { regex: /while/, type: 7 /* T_WHILE */ },
                { regex: /if/, type: 8 /* T_IF */ },
                { regex: /true/, type: 20 /* T_TRUE */ },
                { regex: /false/, type: 19 /* T_FALSE */ },
                { regex: /int/, type: 13 /* T_INT */ },
                { regex: /string/, type: 14 /* T_STRING */ },
                { regex: /boolean/, type: 15 /* T_BOOLEAN */ },
                { regex: /print/, type: 5 /* T_PRINT */ },
                { regex: /\(/, type: 0 /* T_LPAREN */ },
                { regex: /\)/, type: 0 /* T_LPAREN */ },
                { regex: /\{/, type: 2 /* T_LBRACE */ },
                { regex: /\}/, type: 3 /* T_RBRACE */ },
                { regex: /"/, type: 4 /* T_QUOTE */ },
                { regex: /[a-z]/, type: 10 /* T_ID */ },
                { regex: /[0-9]/, type: 9 /* T_DIGIT */ },
                { regex: /\+/, type: 11 /* T_PLUS */ },
                { regex: /\$/, type: 6 /* T_EOF */ },
                { regex: /=/, type: 16 /* T_SINGLE_EQUALS */ },
                { regex: /==/, type: 17 /* T_DOUBLE_EQUALS */ },
                { regex: /!=/, type: 18 /* T_NOT_EQUALS */ },
                { regex: /\$/, type: 6 /* T_EOF */ },
                { regex: /\s+/, type: 21 /* T_WHITE_SPACE */ }
            ];
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;
})(Compiler || (Compiler = {}));
