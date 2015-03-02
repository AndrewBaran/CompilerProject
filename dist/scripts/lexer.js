var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode, symbolTable) {
            this.setupTokenPatterns();

            Compiler.Logger.log("Performing Lexical Analysis");

            var tokenList = [];

            var stringMode = false;
            var eofFound = false;

            // Split source code into token-looking fragments
            var codeFragmentList = this.splitCodeOnSpaces(inputCode);
            codeFragmentList = this.splitCodeOnDelimiters(codeFragmentList);

            var currentFragment = null;
            var currentCode = "";

            var listIndex = 0;

            while (listIndex !== codeFragmentList.length && !eofFound) {
                currentFragment = codeFragmentList[listIndex];
                currentCode = currentFragment.code;

                var tokenMatched = this.matchesTokenPattern(currentCode);

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
                                var errorMessage = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid string character";

                                Compiler.Logger.log(errorMessage);
                                throw errorMessage;
                            }

                            break;

                        case 26 /* T_WHITE_SPACE */:
                            if (stringMode) {
                                if (currentCode === "\n") {
                                    var errorMessage = "Error on line " + currentFragment.lineFoundOn + ": Newline is not a valid string character";

                                    Compiler.Logger.log(errorMessage);
                                    throw errorMessage;
                                }
                            }

                            break;

                        case 20 /* T_SINGLE_EQUALS */:
                            // Next element is available
                            if (!(listIndex + 1 === codeFragmentList.length)) {
                                var nextCodeFragment = codeFragmentList[listIndex + 1];
                                var nextWord = nextCodeFragment.code;
                                currentCode += nextWord;

                                tokenMatched = this.matchesTokenPattern(currentCode);

                                // Submit double equals
                                if (tokenMatched.isMatch) {
                                    token = tokenMatched.token;
                                    listIndex++;
                                }
                            } else {
                                // Submit single equals otherwise
                            }

                            break;

                        case 23 /* T_EXCLAMATION_POINT */:
                            // No more code follows
                            if ((listIndex + 1) === codeFragmentList.length) {
                                var errorMessage = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid lexeme.";

                                Compiler.Logger.log(errorMessage);
                                throw errorMessage;
                            }

                            var nextCodeFragment = codeFragmentList[listIndex + 1];
                            var nextWord = nextCodeFragment.code;
                            currentCode += nextWord;

                            tokenMatched = this.matchesTokenPattern(currentCode);

                            if (tokenMatched.isMatch && tokenMatched.token.getType() === 22 /* T_NOT_EQUALS */) {
                                token = tokenMatched.token;
                                listIndex++;
                            } else {
                                var errorMessage = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid lexeme.";

                                Compiler.Logger.log(errorMessage);
                                throw errorMessage;
                            }

                            break;
                    }

                    var tokenInfo = new Compiler.TokenInfo();
                    tokenInfo.token = token;
                    tokenInfo.lineFoundOn = currentFragment.lineFoundOn;

                    tokenList.push(tokenInfo);
                } else {
                    var errorMessage = "Error on line " + currentFragment.lineFoundOn + ": " + currentCode + " is not a valid lexeme.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }

                listIndex++;
            }

            if (tokenList.length === 0) {
                var errorMessage = "Error! Input was only whitespace, so no tokens were found.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }

            var logWarningCount = 0;

            if (eofFound) {
                // EOF should be last element in code list
                if (listIndex !== codeFragmentList.length) {
                    var eofLine = tokenList[tokenList.length - 1].lineFoundOn;

                    Compiler.Logger.log("Warning! Input found after EOF character, which was on line " + eofLine + ".");
                    logWarningCount++;
                }
            } else {
                Compiler.Logger.log("Warning! EOF character was not found. Adding it to the list");
                logWarningCount++;

                var eofToken = new Compiler.Token();
                eofToken.setType(8 /* T_EOF */);

                var lastLine = tokenList[tokenList.length - 1].lineFoundOn;

                var tokenInfo = new Compiler.TokenInfo();
                tokenInfo.token = eofToken;
                tokenInfo.lineFoundOn = lastLine;

                tokenList.push(tokenInfo);
            }

            Compiler.Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s)");
            Compiler.Logger.log("");

            return tokenList;
        };

        // Looks for a regex match for the word, and if it does, produces a token of the type to be returned
        Lexer.matchesTokenPattern = function (currentCode) {
            var returnTokenMatch = new TokenMatch();
            var patternMatched = false;

            for (var i = 0; i < this.tokenPatterns.length && !patternMatched; i++) {
                var tokenRegex = this.tokenPatterns[i].regex;
                var tokenType = this.tokenPatterns[i].type;

                if (tokenRegex.test(currentCode)) {
                    patternMatched = true;

                    var currentToken = new Compiler.Token();
                    currentToken.setType(tokenType);
                    currentToken.setValue(currentCode);

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
            var codeFragmentList = [];

            var logCurrentLine = 1;

            var stringMode = false;
            var whitespaceRegex = /[\s\n]+/;

            var currentWord = "";
            var charIndex = 0;

            while (charIndex !== inputCode.length) {
                var currentChar = inputCode.charAt(charIndex);
                charIndex++;

                if (!whitespaceRegex.test(currentChar)) {
                    currentWord += currentChar;
                } else {
                    if (stringMode) {
                        currentWord += currentChar;
                    } else if (currentWord.length > 0) {
                        var fragment = new CodeFragment();
                        fragment.code = currentWord;
                        fragment.lineFoundOn = logCurrentLine;

                        codeFragmentList.push(fragment);

                        currentWord = "";
                    }
                }

                if (currentChar === "\"") {
                    stringMode = stringMode ? false : true;
                }

                // Last char
                if (charIndex === inputCode.length) {
                    if (currentWord.length > 0) {
                        var fragment = new CodeFragment();
                        fragment.code = currentWord;
                        fragment.lineFoundOn = logCurrentLine;

                        codeFragmentList.push(fragment);

                        currentWord = "";
                    }
                }

                if (currentChar === "\n") {
                    logCurrentLine++;
                }
            }

            return codeFragmentList;
        };

        Lexer.splitCodeOnDelimiters = function (codeFragmentList) {
            var stringMode = false;
            var delimiterFound = false;

            var currentFragment = null;
            var currentCode = "";

            var wordIndex = 0;

            while (wordIndex !== codeFragmentList.length) {
                currentFragment = codeFragmentList[wordIndex];
                currentCode = currentFragment.code;

                for (var charIndex = 0; charIndex !== currentCode.length; charIndex++) {
                    var currentChar = currentCode.charAt(charIndex);

                    if (currentCode.length === 1) {
                        if (currentChar === "\"") {
                            stringMode = stringMode ? false : true;
                        }

                        continue;
                    }

                    if (this.delimiterChars.test(currentChar)) {
                        var beforeIndex = 0;
                        var afterIndex = 0;

                        // Special case: extract first char of the string
                        if (charIndex === 0) {
                            beforeIndex = afterIndex = charIndex + 1;
                        } else {
                            beforeIndex = afterIndex = charIndex;
                        }

                        var subStringBefore = currentCode.substring(0, beforeIndex);
                        var subStringAfter = currentCode.substring(afterIndex, currentCode.length);

                        if (subStringBefore.length !== 0) {
                            currentFragment.code = subStringBefore;
                            codeFragmentList[wordIndex] = currentFragment;
                        }

                        // Insert substring after current index
                        if (subStringAfter.length !== 0) {
                            var fragment = new CodeFragment();
                            fragment.code = subStringAfter;
                            fragment.lineFoundOn = currentFragment.lineFoundOn;

                            codeFragmentList.splice(wordIndex + 1, 0, fragment);
                        }

                        delimiterFound = true;
                        break;
                    } else if (stringMode) {
                        var subStringBefore = currentChar;
                        var subStringAfter = currentCode.substring(1, currentCode.length);

                        if (subStringBefore.length !== 0) {
                            currentFragment.code = subStringBefore;
                            codeFragmentList[wordIndex] = currentFragment;
                        }

                        // Insert substring after current index
                        if (subStringAfter.length !== 0) {
                            var fragment = new CodeFragment();
                            fragment.code = subStringAfter;
                            fragment.lineFoundOn = currentFragment.lineFoundOn;

                            codeFragmentList.splice(wordIndex + 1, 0, fragment);
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

            return codeFragmentList;
        };
        return Lexer;
    })();
    Compiler.Lexer = Lexer;

    // Structs
    var CodeFragment = (function () {
        function CodeFragment() {
            this.code = "";
            this.lineFoundOn = -1;
        }
        return CodeFragment;
    })();

    var TokenMatch = (function () {
        function TokenMatch() {
            this.token = new Compiler.Token();
            this.token.setType(0 /* T_NO_MATCH */);
            this.isMatch = false;
        }
        return TokenMatch;
    })();
})(Compiler || (Compiler = {}));
