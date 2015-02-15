var Compiler;
(function (Compiler) {
    var SymbolTable = (function () {
        function SymbolTable() {
            // Populate the table with reserved words
            var reservedWordList = ["while", "if", "print", "int", "string", "boolean", "false", "true", "!=", "=", "=="];

            this.table = [];
            this.nextAvailableIndex = 0;

            for (var i = 0; i < reservedWordList.length; i++) {
                var entry = new SymbolTableEntry();
                entry.entryNumber = this.nextAvailableIndex++;
                entry.tokenValue = reservedWordList[i];
                entry.isReservedWord = true;

                this.table.push(entry);
            }
        }
        SymbolTable.prototype.insert = function (token) {
            var entry = new SymbolTableEntry();
            entry.entryNumber = this.nextAvailableIndex++;
            entry.tokenType = token.getType();
            entry.tokenValue = token.getValue();
            entry.isReservedWord = false;

            this.table.push(entry);
        };

        SymbolTable.prototype.getEntry = function (entryNumber) {
            return this.table[entryNumber];
        };

        SymbolTable.prototype.hasReservedWordPrefix = function (inputWord) {
            for (var i = 0; i < this.table.length; i++) {
                var currentEntry = this.table[i];

                if (currentEntry.isReservedWord) {
                    // Prefix found
                    if (currentEntry.tokenValue.indexOf(inputWord) === 0) {
                        return true;
                    }
                }
            }

            return false;
        };

        SymbolTable.prototype.getSize = function () {
            return this.nextAvailableIndex;
        };
        return SymbolTable;
    })();
    Compiler.SymbolTable = SymbolTable;

    // TODO Place in own file?
    var SymbolTableEntry = (function () {
        function SymbolTableEntry() {
            this.entryNumber = -1;
            this.tokenType = 1 /* T_DEFAULT */;
            this.tokenValue = "";
            this.isReservedWord = false;
            this.scopeLevel = 0;
            this.identifierType = "";
        }
        SymbolTableEntry.prototype.toString = function () {
            var token = new Compiler.Token();
            token.setType(this.tokenType);
            token.setValue(this.tokenValue);

            var result = this.entryNumber + " | " + token.getTokenName() + " | " + token.getValue() + " | " + this.scopeLevel;
            return result;
        };
        return SymbolTableEntry;
    })();
    Compiler.SymbolTableEntry = SymbolTableEntry;
})(Compiler || (Compiler = {}));
