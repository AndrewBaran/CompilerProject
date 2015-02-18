var Compiler;
(function (Compiler) {
    var Lexer = (function () {
        function Lexer() {
        }
        /*
        TODO: Game plan
        
        Split inputCode on spaces and newline
        while loop over each word in the list
        if word matches regex
        submit to stream
        else if word contains delimiter chars
        Find index of first delimiter
        make current index substring up to, but not including delimiter
        add string from delimiter on to list after current index
        relex the current word
        else
        error?
        
        Need to combine strings with spaces somehow
        
        */
        // TODO: Remove log messages when finished
        // Separates the input code into a list of tokens and returns that list
        Lexer.tokenizeCode = function (inputCode, symbolTable) {
            this.setupTokenPatterns();

            Compiler.Logger.log("Performing lexical analysis");

            var currentToken = new Compiler.Token();

            var currentChar = "";
            var currentWord = "";

            var currentIndex = 0;

            var logCurrentLetter = 1;
            var logCurrentLine = 1;
            var logWarningCount = 0;

            var isPrefix = false;

            // TODO: Remove above this eventually
            var tokenList = [];

            var stringMode = false;
            var eofFound = false;

            var splitCodeList = this.splitCodeOnSpaces(inputCode);

            var delimiterFound = false;

            var word = "";
            var wordIndex = 0;

            while (wordIndex !== splitCodeList.length) {
                word = splitCodeList[wordIndex];

                for (var charIndex = 0; charIndex !== word.length && word.length !== 1; charIndex++) {
                    var currentChar = word.charAt(charIndex);

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
                            beforeIndex = charIndex;
                            afterIndex = charIndex;
                        }

                        var subStringBefore = word.substring(0, beforeIndex);
                        var subStringAfter = word.substring(afterIndex, word.length);

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
                        var subStringAfter = word.substring(1, word.length);

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

            // TODO: Remove eventually
            Compiler.Logger.log("Code fragments: ");
            for (var i = 0; i < splitCodeList.length; i++) {
                Compiler.Logger.log("[" + i + "] = " + splitCodeList[i]);

                if (splitCodeList[i] === "\n" || splitCodeList[i] === " ") {
                    Compiler.Logger.log("Whitespace");
                }
            }

            stringMode = false;

            // TODO: Make it so you can combine words (ex: ! and =, = and =)
            // Tokenize the individual elements of the split up code now
            var listIndex = 0;

            while (listIndex !== splitCodeList.length) {
                word = splitCodeList[listIndex];

                var tokenMatched = this.matchesTokenPattern(word);

                if (tokenMatched.isMatch) {
                    var token = tokenMatched.token;

                    if (token.getType() === 6 /* T_QUOTE */) {
                        stringMode = stringMode ? false : true;
                    }

                    // T_ID and T_CHAR share same regex, so swap on the spot
                    if (stringMode && token.getType() === 12 /* T_ID */) {
                        token.setType(13 /* T_CHAR */);
                    }

                    Compiler.Logger.log(word + " matched a regex");
                    Compiler.Logger.log("Type was " + tokenMatched.token.getTokenName());

                    tokenList.push(token);
                } else {
                    var errorMessage = "Error! " + word + " is not a valid lexeme.";

                    Compiler.Logger.log(errorMessage);
                    throw errorMessage;
                }

                listIndex++;
            }

            return tokenList;

            while (currentIndex != inputCode.length && !eofFound) {
                currentChar = inputCode[currentIndex];
                currentIndex++;

                currentWord += currentChar;

                // Attempt to find match for token
                var tokenMatched = this.matchesTokenPattern(currentWord);

                // Disregard old token if new match was found
                if (tokenMatched.token.getType() !== 0 /* T_NO_MATCH */) {
                    currentToken = tokenMatched.token;
                }

                if (tokenMatched.isMatch) {
                    Compiler.Logger.log("Token found: " + currentToken.getTokenName());

                    if (currentToken.getType() === 6 /* T_QUOTE */) {
                        if (!stringMode) {
                            stringMode = true;

                            Compiler.Logger.log("Producing token: " + currentToken.getTokenName());
                            tokenList.push(currentToken);

                            currentToken = new Compiler.Token();
                            currentWord = "";
                        } else {
                            stringMode = false;
                        }
                    }

                    if (stringMode && currentToken.getType() !== 1 /* T_DEFAULT */) {
                        // T_ID shares same regex as T_CHAR, so convert on the spot
                        if (currentToken.getType() === 12 /* T_ID */) {
                            currentToken.setType(13 /* T_CHAR */);
                        }

                        if (currentToken.getType() === 13 /* T_CHAR */) {
                            Compiler.Logger.log("Producing token: " + currentToken.getTokenName());
                            tokenList.push(currentToken);
                        } else if (currentToken.getType() === 25 /* T_WHITE_SPACE */ && currentToken.getValue() === " ") {
                            Compiler.Logger.log("Producing token: " + currentToken.getTokenName());
                            tokenList.push(currentToken);
                        } else {
                            var errorMessage = "Error on line " + logCurrentLine + ", character " + logCurrentLetter + ": " + currentWord + " is a not valid string character";

                            Compiler.Logger.log(errorMessage);
                            throw errorMessage;
                        }

                        currentToken = new Compiler.Token();
                        currentWord = "";
                    }

                    isPrefix = false;
                } else if (symbolTable.hasReservedWordPrefix(currentWord)) {
                    isPrefix = true;
                } else {
                    if (currentToken.getType() !== 1 /* T_DEFAULT */) {
                        if (currentToken.getType() === 8 /* T_EOF */) {
                            eofFound = true;
                        }

                        // Discard whitespace tokens
                        if (currentToken.getType() !== 25 /* T_WHITE_SPACE */ && !isPrefix) {
                            Compiler.Logger.log("Producing token: " + currentToken.getTokenName());
                            tokenList.push(currentToken);

                            // TODO: Remove when doing project 2?
                            if (currentToken.getType() === 12 /* T_ID */) {
                                Compiler.Logger.log("Adding " + currentToken.getTokenName() + " to the symbol table");
                                symbolTable.insert(currentToken);
                            }
                        }

                        currentWord = "";
                        currentToken = new Compiler.Token();

                        // Back up and re-lex the current character
                        currentIndex--;
                        logCurrentLetter--;

                        if (currentChar === "\n") {
                            logCurrentLine--;
                        }

                        isPrefix = false;
                    } else {
                        var errorMessage = "Error on line " + logCurrentLine + ", character " + logCurrentLetter + ": " + currentWord + " is a not valid lexeme";

                        Compiler.Logger.log(errorMessage);
                        throw errorMessage;
                    }
                }

                // Final token processing
                if (currentIndex === inputCode.length) {
                    if (currentToken.getType() !== 1 /* T_DEFAULT */ && currentToken.getType() !== 25 /* T_WHITE_SPACE */ && !isPrefix) {
                        // Disregard prefixes
                        Compiler.Logger.log("Producing token: " + currentToken.getTokenName());
                        tokenList.push(currentToken);
                    }

                    if (currentToken.getType() === 8 /* T_EOF */) {
                        eofFound = true;
                    }
                }

                logCurrentLetter++;

                if (currentChar === "\n") {
                    logCurrentLine++;
                    logCurrentLetter = 0;
                }
            }

            if (eofFound) {
                var whitespaceRegex = /[\s|\n]/;
                var indexAfterEOF = inputCode.indexOf("$") + 1;

                for (currentIndex = indexAfterEOF; currentIndex < inputCode.length; currentIndex++) {
                    currentChar = inputCode[currentIndex];

                    if (!(whitespaceRegex.test(currentChar))) {
                        Compiler.Logger.log("Warning on line " + logCurrentLine + ", character " + logCurrentLetter + ": Input found after EOF character");
                        logWarningCount++;

                        break;
                    }

                    logCurrentLetter++;

                    if (currentChar === "\n") {
                        logCurrentLetter = 0;
                        logCurrentLine++;
                    }
                }
            } else {
                Compiler.Logger.log("Warning! EOF character was not found. Adding it to the list");
                logWarningCount++;

                var eofToken = new Compiler.Token();
                eofToken.setType(8 /* T_EOF */);

                tokenList.push(eofToken);
            }

            Compiler.Logger.log("Lexical analysis produced 0 errors and " + logWarningCount + " warning(s)");

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
                    currentToken.setType(tokenType);
                    currentToken.setValue(currentWord);

                    returnTokenMatch.token = currentToken;
                }
            }

            returnTokenMatch.isMatch = patternMatched;
            return returnTokenMatch;
        };

        Lexer.setupTokenPatterns = function () {
            this.tokenPatterns = [
                { regex: /^while$/, type: 9 /* T_WHILE */ },
                { regex: /^if$/, type: 10 /* T_IF */ },
                { regex: /^true$/, type: 24 /* T_TRUE */ },
                { regex: /^false$/, type: 23 /* T_FALSE */ },
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
                { regex: /^[\s|\n]$/, type: 25 /* T_WHITE_SPACE */ }
            ];

            this.delimiterChars = /^[\{\}\(\_\)\$\"0-9!=+]$/;
        };

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
                        Compiler.Logger.log("Submitting " + currentWord);
                        splitCodeList.push(currentWord);
                        currentWord = "";
                    }
                }
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
