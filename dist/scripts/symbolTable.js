var Compiler;
(function (Compiler) {
    var SymbolTable = (function () {
        function SymbolTable() {
            this.setDefaultScope();
            this.currentScopeTable = SymbolTable.defaultScopeTable;
        }
        SymbolTable.prototype.setDefaultScope = function () {
            SymbolTable.defaultScopeTable = new ScopeTable();
            SymbolTable.defaultScopeTable.setScopeLevel(-1);
        };

        SymbolTable.prototype.insertEntry = function (token, typeValue) {
            var result = false;

            if (token.getType() === 12 /* T_ID */) {
                result = this.currentScopeTable.insertEntry(token, typeValue);
            } else {
                Compiler.Logger.log("Error! Attempt to insert " + token.getTokenName() + " into symbol table was made.");
                result = false;
            }

            return result;
        };

        SymbolTable.prototype.openScope = function () {
            var newScope = new ScopeTable();
            newScope.setParent(this.currentScopeTable);
            newScope.setScopeLevel(this.currentScopeTable.getScopeLevel() + 1);

            this.currentScopeTable.addChildScope(newScope);

            this.currentScopeTable = newScope;
        };

        SymbolTable.prototype.closeScope = function () {
            var parent = this.currentScopeTable.getParent();

            if (parent !== null) {
                this.currentScopeTable = parent;
            }
        };

        SymbolTable.prototype.getCurrentScope = function () {
            return this.currentScopeTable;
        };
        return SymbolTable;
    })();
    Compiler.SymbolTable = SymbolTable;

    // TODO: Move to another file
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
