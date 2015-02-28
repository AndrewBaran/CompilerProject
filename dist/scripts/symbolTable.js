var Compiler;
(function (Compiler) {
    var SymbolTable = (function () {
        function SymbolTable() {
            this.table = [];
            this.nextAvailableIndex = 0;

            this.scopeLevel = 0;
        }
        SymbolTable.prototype.insert = function (token) {
            var entry = new Compiler.SymbolTableEntry();
            entry.setEntryNumber(this.nextAvailableIndex++);
            entry.setTokenType(token.getType());
            entry.setTokenValue(token.getValue());

            this.table.push(entry);
        };

        SymbolTable.prototype.getEntry = function (entryNumber) {
            return this.table[entryNumber];
        };

        SymbolTable.prototype.getSize = function () {
            return this.nextAvailableIndex;
        };

        SymbolTable.prototype.getScopeLevel = function () {
            return this.scopeLevel;
        };
        return SymbolTable;
    })();
    Compiler.SymbolTable = SymbolTable;
})(Compiler || (Compiler = {}));
