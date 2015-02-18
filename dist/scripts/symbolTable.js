var Compiler;
(function (Compiler) {
    var SymbolTable = (function () {
        function SymbolTable() {
            // Populate the table with reserved words
            var reservedWordList = ["while", "if", "print", "int", "string", "boolean", "false", "true", "!=", "=", "=="];

            this.table = [];
            this.nextAvailableIndex = 0;

            for (var i = 0; i < reservedWordList.length; i++) {
                var entry = new Compiler.SymbolTableEntry();
                entry.setEntryNumber(this.nextAvailableIndex++);
                entry.setTokenValue(reservedWordList[i]);
                entry.setReservedWord(true);

                this.table.push(entry);
            }
        }
        SymbolTable.prototype.insert = function (token) {
            var entry = new Compiler.SymbolTableEntry();
            entry.setEntryNumber(this.nextAvailableIndex++);
            entry.setTokenType(token.getType());
            entry.setTokenValue(token.getValue());
            entry.setReservedWord(false);

            this.table.push(entry);
        };

        SymbolTable.prototype.getEntry = function (entryNumber) {
            return this.table[entryNumber];
        };

        SymbolTable.prototype.getSize = function () {
            return this.nextAvailableIndex;
        };
        return SymbolTable;
    })();
    Compiler.SymbolTable = SymbolTable;
})(Compiler || (Compiler = {}));
