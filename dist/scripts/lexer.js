var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // TODO: Be able to lex strings
        // TODO: Associate values with certain tokens
        // TODO: Place ids in the symbol table, link the value to the symbol table entry
        // TODO: If EOF cuts off a lexeme mid way (ex: in$), fix that
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode, symbolTable) {
            this.setupTokenPatterns();

            Compiler.Logger.log("Performing lexical analysis");

            var tokenList = [];
            var currentToken = new Compiler.Token();

            var currentChar = "";
            var currentWord = "";

            var currentIndex = 0;

            var logCurrentLetter = 1;
            var logCurrentLine = 1;
            var logWarningCount = 0;

            var eofFound = false;

            while (currentIndex != inputCode.length && !eofFound) {
                currentChar = inputCode[currentIndex];
                currentIndex++;

                logCurrentLetter++;

                currentWord += currentChar;

                // For error reporting
                if (currentChar === "\n") {
                    logCurrentLine++;
                    logCurrentLetter = 0;
                }

                // Attempt to find match for token
                var tokenMatched = this.matchesTokenPattern(currentWord);

                // Disregard old token if new match was found
                if (tokenMatched.token.type !== 0 /* T_NO_MATCH */) {
                    currentToken = tokenMatched.token;
                }

                if (tokenMatched.isMatch) {
                    Compiler.Logger.log("Token found: " + TokenType[currentToken.type]);
                } else {
                    // Didn't match a pattern
                    if (!symbolTable.hasReservedWordPrefix(currentWord)) {
                        if (currentToken.type !== 1 /* T_DEFAULT */) {
                            if (currentToken.type === 8 /* T_EOF */) {
                                eofFound = true;
                            }

                            // Discard whitespace tokens
                            if (currentToken.type !== 23 /* T_WHITE_SPACE */) {
                                Compiler.Logger.log("Producing token: " + TokenType[currentToken.type]);
                                tokenList.push(currentToken);
                            }

                            currentWord = "";
                            currentToken = new Compiler.Token();

                            // Back up and re-lex the current character
                            currentIndex--;
                            logCurrentLetter--;

                            if (currentChar === "\n") {
                                logCurrentLine--;
                            }
                        } else {
                            var errorMessage = "Error on line " + logCurrentLine + ", character " + logCurrentLetter + ": " + currentWord + " is a not valid lexeme.";

                            Compiler.Logger.log(errorMessage);
                            throw errorMessage;
                        }
                    }
                }
            }

            // TODO: Refactor into while loop
            // Extract last token from lex
            if (currentToken.type !== 1 /* T_DEFAULT */ && currentToken.type !== 23 /* T_WHITE_SPACE */) {
                // Disregard prefixes
                Compiler.Logger.log("Producing token: " + TokenType[currentToken.type]);
                tokenList.push(currentToken);

                if (currentToken.type === 8 /* T_EOF */) {
                    eofFound = true;
                }
            }

            if (eofFound) {
                var whitespaceRegex = /[\s|\n]/;
                var indexAfterEOF = inputCode.indexOf("$") + 1;

                for (currentIndex = indexAfterEOF; currentIndex < inputCode.length; currentIndex++) {
                    currentChar = inputCode[currentIndex];

                    if (!(whitespaceRegex.test(currentChar))) {
                        Compiler.Logger.log("Warning! Input found after EOF character ( $ ).");
                        logWarningCount++;

                        break;
                    }
                }
            } else {
                Compiler.Logger.log("Warning! EOF character ( $ ) was not found. Adding it to the list.");
                logWarningCount++;

                var eofToken = new Compiler.Token();
                eofToken.type = 8 /* T_EOF */;

                tokenList.push(eofToken);
            }

            Compiler.Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s).");

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

                if (tokenRegex.test(currentWord)) {
                    patternMatched = true;

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
                { regex: /^\)$/g, type: 3 /* T_RPAREN */ },
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
