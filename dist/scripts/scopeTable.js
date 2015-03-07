var Compiler;
(function (Compiler) {
    var ScopeTable = (function () {
        function ScopeTable() {
            this.entryTable = [];

            for (var i = 0; i < _Constants.MAX_SCOPE_ENTRIES; i++) {
                this.entryTable[i] = null;
            }

            this.nextAvailableIndex = 0;

            this.scopeLevel = 0;

            this.parentScope = null;
            this.childScopeList = [];
        }
        ScopeTable.prototype.insertEntry = function (token, typeValue) {
            var entry = new Compiler.SymbolTableEntry();
            entry.setEntryNumber(this.nextAvailableIndex++);
            entry.setIdName(token.getValue());
            entry.setIdType(typeValue);

            var hashIndex = this.hashID(entry.getIdName());

            if (this.entryTable[hashIndex] === null) {
                this.entryTable[hashIndex] = entry;
                return true;
            } else {
                return false;
            }
        };

        ScopeTable.prototype.hashID = function (idName) {
            var firstLowerCaseValue = 97;

            var hashValue = idName.charCodeAt(0);
            hashValue = hashValue - firstLowerCaseValue;

            return hashValue;
        };

        ScopeTable.prototype.addChildScope = function (child) {
            this.childScopeList.push(child);
        };

        ScopeTable.prototype.getEntry = function (entryNumber) {
            return this.entryTable[entryNumber];
        };

        ScopeTable.prototype.getSize = function () {
            return this.nextAvailableIndex;
        };

        ScopeTable.prototype.getScopeLevel = function () {
            return this.scopeLevel;
        };

        ScopeTable.prototype.setScopeLevel = function (scopeLevel) {
            this.scopeLevel = scopeLevel;
        };

        ScopeTable.prototype.getParent = function () {
            return this.parentScope;
        };

        ScopeTable.prototype.setParent = function (parentScope) {
            this.parentScope = parentScope;
        };

        ScopeTable.prototype.getChildList = function () {
            return this.childScopeList;
        };
        return ScopeTable;
    })();
    Compiler.ScopeTable = ScopeTable;
})(Compiler || (Compiler = {}));
