var Compiler;
(function (Compiler) {
    var SymbolTable = (function () {
        function SymbolTable() {
            // Populate the table with reserved words
            var reservedWordList = ["while", "if", "print", "int", "string", "boolean", "false", "true", "!=", "=", "=="];

            this.table = [];

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
            entry.tokenType = token.type;
            entry.tokenValue = token.value;
            entry.isReservedWord = false;

            this.table.push(entry);
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
        return SymbolTable;
    })();
    Compiler.SymbolTable = SymbolTable;

    var SymbolTableEntry = (function () {
        function SymbolTableEntry() {
        }
        return SymbolTableEntry;
    })();
    Compiler.SymbolTableEntry = SymbolTableEntry;
})(Compiler || (Compiler = {}));
