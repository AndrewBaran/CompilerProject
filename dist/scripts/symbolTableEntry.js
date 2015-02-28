var Compiler;
(function (Compiler) {
    var SymbolTableEntry = (function () {
        function SymbolTableEntry() {
            this.entryNumber = -1;
            this.value = "";
            this.identifierType = "";
        }
        SymbolTableEntry.prototype.getEntryNumber = function () {
            return this.entryNumber;
        };

        SymbolTableEntry.prototype.setEntryNumber = function (entryNumber) {
            this.entryNumber = entryNumber;
        };

        SymbolTableEntry.prototype.getValue = function () {
            return this.value;
        };

        SymbolTableEntry.prototype.setValue = function (value) {
            this.value = value;
        };

        SymbolTableEntry.prototype.getIdentifierType = function () {
            return this.identifierType;
        };

        SymbolTableEntry.prototype.setIdentifierType = function (identifierType) {
            this.identifierType = identifierType;
        };

        // TODO: Make this different
        SymbolTableEntry.prototype.toString = function () {
            return "";
        };
        return SymbolTableEntry;
    })();
    Compiler.SymbolTableEntry = SymbolTableEntry;
})(Compiler || (Compiler = {}));
