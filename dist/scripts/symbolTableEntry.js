var Compiler;
(function (Compiler) {
    var SymbolTableEntry = (function () {
        function SymbolTableEntry() {
            this.entryNumber = -1;
            this.idName = "";
            this.value = "";
            this.idType = "";
        }
        SymbolTableEntry.prototype.getEntryNumber = function () {
            return this.entryNumber;
        };

        SymbolTableEntry.prototype.setEntryNumber = function (entryNumber) {
            this.entryNumber = entryNumber;
        };

        SymbolTableEntry.prototype.getIdName = function () {
            return this.idName;
        };

        SymbolTableEntry.prototype.setIdName = function (idName) {
            this.idName = idName;
        };

        SymbolTableEntry.prototype.getValue = function () {
            return this.value;
        };

        SymbolTableEntry.prototype.setValue = function (value) {
            this.value = value;
        };

        SymbolTableEntry.prototype.getIdType = function () {
            return this.idType;
        };

        SymbolTableEntry.prototype.setIdType = function (idType) {
            this.idType = idType;
        };
        return SymbolTableEntry;
    })();
    Compiler.SymbolTableEntry = SymbolTableEntry;
})(Compiler || (Compiler = {}));
