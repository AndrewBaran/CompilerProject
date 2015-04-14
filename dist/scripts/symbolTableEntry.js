var Compiler;
(function (Compiler) {
    var SymbolTableEntry = (function () {
        function SymbolTableEntry() {
            this.entryNumber = -1;
            this.idName = "";
            this.idType = "";
            this.lineNumber = -1;

            this.isInitialized = false;

            this.numReferences = 0;
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

        SymbolTableEntry.prototype.getIdType = function () {
            return this.idType;
        };

        SymbolTableEntry.prototype.setIdType = function (idType) {
            this.idType = idType;
        };

        SymbolTableEntry.prototype.getLineNumber = function () {
            return this.lineNumber;
        };

        SymbolTableEntry.prototype.setLineNumber = function (lineNumber) {
            this.lineNumber = lineNumber;
        };

        SymbolTableEntry.prototype.getIsInitialized = function () {
            return this.isInitialized;
        };

        SymbolTableEntry.prototype.setIsInitialized = function () {
            this.isInitialized = true;
        };

        SymbolTableEntry.prototype.getNumReferences = function () {
            return this.numReferences;
        };

        SymbolTableEntry.prototype.incrementNumReferences = function () {
            this.numReferences++;
        };
        return SymbolTableEntry;
    })();
    Compiler.SymbolTableEntry = SymbolTableEntry;
})(Compiler || (Compiler = {}));
