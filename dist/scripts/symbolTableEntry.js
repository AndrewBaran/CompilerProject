var Compiler;
(function (Compiler) {
    var SymbolTableEntry = (function () {
        function SymbolTableEntry() {
            this.entryNumber = -1;
            this.tokenType = 1 /* T_DEFAULT */;
            this.tokenValue = "";
            this.identifierType = "";
        }
        SymbolTableEntry.prototype.getEntryNumber = function () {
            return this.entryNumber;
        };

        SymbolTableEntry.prototype.setEntryNumber = function (entryNumber) {
            this.entryNumber = entryNumber;
        };

        SymbolTableEntry.prototype.getTokenType = function () {
            return this.tokenType;
        };

        SymbolTableEntry.prototype.setTokenType = function (tokenType) {
            this.tokenType = tokenType;
        };

        SymbolTableEntry.prototype.getTokenValue = function () {
            return this.tokenValue;
        };

        SymbolTableEntry.prototype.setTokenValue = function (tokenValue) {
            this.tokenValue = tokenValue;
        };

        SymbolTableEntry.prototype.getIdentifierType = function () {
            return this.identifierType;
        };

        SymbolTableEntry.prototype.setIdentifierType = function (identifierType) {
            this.identifierType = identifierType;
        };

        SymbolTableEntry.prototype.toString = function () {
            var token = new Compiler.Token();
            token.setType(this.tokenType);
            token.setValue(this.tokenValue);

            var result = this.entryNumber + " | " + token.getTokenName() + " | " + token.getValue();
            return result;
        };
        return SymbolTableEntry;
    })();
    Compiler.SymbolTableEntry = SymbolTableEntry;
})(Compiler || (Compiler = {}));
