var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode, symbolTable) {
            this.setupTokenPatterns();

            Compiler.Logger.log("Performing lexical analysis");

            var logCurrentLetter = 1;
            var logCurrentLine = 1;
            var logWarningCount = 0;

            var tokenList = [];

            var stringMode = false;
            var eofFound = false;

            // Split source code into token-looking fragments
            var splitCodeList = this.splitCodeOnSpaces(inputCode);
            splitCodeList = this.splitCodeOnDelimiters(splitCodeList);

            var listIndex = 0;
            var currentWord = "";

            while (listIndex !== splitCodeList.length && !eofFound) {
                currentWord = splitCodeList[listIndex];

                var tokenMatched = this.matchesTokenPattern(currentWord);

                if (tokenMatched.isMatch) {
                    var token = tokenMatched.token;

                    switch (token.getType()) {
                        case 6 /* T_QUOTE */:
                            stringMode = stringMode ? false : true;
                            break;

                        case 8 /* T_EOF */:
                            eofFound = true;
                            break;

                        case 12 /* T_ID */:
                            // T_ID and T_CHAR share same regex, so swap on the spot
                            if (stringMode) {
                                token.setType(13 /* T_CHAR */);
                            }

                            break;

                        case 11 /* T_DIGIT */:
                            if (stringMode) {
                                var errorMessage = "Error! " + currentWord + " is not a valid string character";

                                Compiler.Logger.log(errorMessage);
                                throw errorMessage;
                            }

                            break;

                        case 26 /* T_WHITE_SPACE */:
                            if (stringMode) {
                                if (currentWord === "\n") {
                                    var errorMessage = "Error! Newline is not a valid string character";

                                    Compiler.Logger.log(errorMessage);
                                    throw errorMessage;
                                }
                            }

                            break;

                        case 20 /* T_SINGLE_EQUALS */:
                            // Check if next index is a single equals
                            var nextCodeSegment = splitCodeList[listIndex + 1];
                            currentWord += nextCodeSegment;

                            tokenMatched = this.matchesTokenPattern(currentWord);

                            // Submit double equals
                            if (tokenMatched.isMatch) {
                                token = tokenMatched.token;
                                listIndex++;
                            }

                            break;

                        case 23 /* T_EXCLAMATION_POINT */:
                            // No more code follows
                            if ((listIndex + 1) === splitCodeList.length) {
                                var errorMessage = "Error! " + currentWord + " is not a valid lexeme.";

                                Compiler.Logger.log(errorMessage);
                                throw errorMessage;
                            }

                            var nextCodeSegment = splitCodeList[listIndex + 1];
                            currentWord += nextCodeSegment;

                            tokenMatched = this.matchesTokenPattern(currentWord);

                            if (tokenMatched.isMatch && tokenMatched.token.getType() === 22 /* T_NOT_EQUALS */) {
                                token = tokenMatched.token;
                                listIndex++;
                            } else {
                                var errorMessage = "Error! " + currentWord + " is not a valid lexeme.";

                                Compiler.Logger.log(errorMessage);
                                throw errorMessage;
                            }

                            break;
                    }

                    tokenList.push(token);
                } else {
                    var errorMessage = "Error! " + currentWord + " is not a valid lexeme.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }

                listIndex++;
            }

            if (eofFound) {
                // EOF should be last element in code list
                if (listIndex !== splitCodeList.length) {
                    Compiler.Logger.log("Warning! Input found after EOF character");
                    logWarningCount++;
                }
            } else {
                Compiler.Logger.log("Warning! EOF character was not found. Adding it to the list");
                logWarningCount++;

                var eofToken = new Compiler.Token();
                eofToken.setType(8 /* T_EOF */);

                tokenList.push(eofToken);
            }

            Compiler.Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s)");
            Compiler.Logger.log("");

            return tokenList;
        };

        // Looks for a regex match for the word, and if it does, produces a token of the type to be returned
        Lexer.matchesTokenPattern = function (currentWord) {
            var returnTokenMatch = new TokenMatch();
            var patternMatched = false;

            for (var i = 0; i < this.tokenPatterns.length && !patternMatched; i++) {
                var tokenRegex = this.tokenPatterns[i].regex;
                var tokenType = this.tokenPatterns[i].type;

                if (tokenRegex.test(currentWord)) {
                    patternMatched = true;

                    var currentToken = new Compiler.Token();
                    currentToken.setType(tokenType);
                    currentToken.setValue(currentWord);

                    returnTokenMatch.token = currentToken;

                    break;
                }
            }

            returnTokenMatch.isMatch = patternMatched;
            return returnTokenMatch;
        };

        // Associate each regex with corresponding token
        Lexer.setupTokenPatterns = function () {
            this.tokenPatterns = [
                { regex: /^while$/, type: 9 /* T_WHILE */ },
                { regex: /^if$/, type: 10 /* T_IF */ },
                { regex: /^true$/, type: 25 /* T_TRUE */ },
                { regex: /^false$/, type: 24 /* T_FALSE */ },
                { regex: /^int$/, type: 17 /* T_INT */ },
                { regex: /^string$/, type: 18 /* T_STRING */ },
                { regex: /^boolean$/, type: 19 /* T_BOOLEAN */ },
                { regex: /^print$/, type: 7 /* T_PRINT */ },
                { regex: /^\($/, type: 2 /* T_LPAREN */ },
                { regex: /^\)$/, type: 3 /* T_RPAREN */ },
                { regex: /^\{$/, type: 4 /* T_LBRACE */ },
                { regex: /^\}$/, type: 5 /* T_RBRACE */ },
                { regex: /^"$/, type: 6 /* T_QUOTE */ },
                { regex: /^[a-z]$/, type: 12 /* T_ID */ },
                { regex: /^[0-9]$/, type: 11 /* T_DIGIT */ },
                { regex: /^\+$/, type: 14 /* T_PLUS */ },
                { regex: /^\$$/, type: 8 /* T_EOF */ },
                { regex: /^=$/, type: 20 /* T_SINGLE_EQUALS */ },
                { regex: /^==$/, type: 21 /* T_DOUBLE_EQUALS */ },
                { regex: /^!=$/, type: 22 /* T_NOT_EQUALS */ },
                { regex: /^!$/, type: 23 /* T_EXCLAMATION_POINT */ },
                { regex: /^[\s|\n]$/, type: 26 /* T_WHITE_SPACE */ }
            ];

            this.delimiterChars = /^[\{\}\(\_\)\$\"!=+]$/;
        };

        // Preserves spaces within strings
        Lexer.splitCodeOnSpaces = function (inputCode) {
            var currentWord = "";
            var charIndex = 0;

            var splitCodeList = [];

            var stringMode = false;
            var whitespaceRegex = /[\s\n]+/;

            while (charIndex !== inputCode.length) {
                var currentChar = inputCode.charAt(charIndex);
                charIndex++;

                if (!whitespaceRegex.test(currentChar)) {
                    currentWord += currentChar;
                } else {
                    if (stringMode) {
                        currentWord += currentChar;
                    } else if (currentWord.length > 0) {
                        splitCodeList.push(currentWord);
                        currentWord = "";
                    }
                }

                if (currentChar === "\"") {
                    stringMode = stringMode ? false : true;
                }

                // Last char
                if (charIndex === inputCode.length) {
                    if (currentWord.length > 0) {
                        splitCodeList.push(currentWord);
                        currentWord = "";
                    }
                }
            }

            return splitCodeList;
        };

        Lexer.splitCodeOnDelimiters = function (splitCodeList) {
            var stringMode = false;
            var delimiterFound = false;

            var currentWord = "";
            var wordIndex = 0;

            while (wordIndex !== splitCodeList.length) {
                currentWord = splitCodeList[wordIndex];

                for (var charIndex = 0; charIndex !== currentWord.length && currentWord.length !== 1; charIndex++) {
                    var currentChar = currentWord.charAt(charIndex);

                    if (this.delimiterChars.test(currentChar)) {
                        if (currentChar === "\"") {
                            stringMode = stringMode ? false : true;
                        }

                        var beforeIndex = 0;
                        var afterIndex = 0;

                        // Special case: extract first char of the string
                        if (charIndex === 0) {
                            beforeIndex = afterIndex = charIndex + 1;
                        } else {
                            beforeIndex = afterIndex = charIndex;
                        }

                        var subStringBefore = currentWord.substring(0, beforeIndex);
                        var subStringAfter = currentWord.substring(afterIndex, currentWord.length);

                        if (subStringBefore.length !== 0) {
                            splitCodeList[wordIndex] = subStringBefore;
                        }

                        // Insert substring after current index
                        if (subStringAfter.length !== 0) {
                            splitCodeList.splice(wordIndex + 1, 0, subStringAfter);
                        }

                        delimiterFound = true;
                        break;
                    } else if (stringMode) {
                        var subStringBefore = currentChar;
                        var subStringAfter = currentWord.substring(1, currentWord.length);

                        if (subStringBefore.length !== 0) {
                            splitCodeList[wordIndex] = subStringBefore;
                        }

                        // Insert substring after current index
                        if (subStringAfter.length !== 0) {
                            splitCodeList.splice(wordIndex + 1, 0, subStringAfter);
                        }

                        delimiterFound = true;
                        break;
                    }
                }

                if (!delimiterFound) {
                    wordIndex++;
                }

                delimiterFound = false;
            }

            return splitCodeList;
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;

    var TokenMatch = (function () {
        function TokenMatch() {
            this.token = new Compiler.Token();
            this.token.setType(0 /* T_NO_MATCH */);
            this.isMatch = false;
        }
        return TokenMatch;
    })();
})(Compiler || (Compiler = {}));
