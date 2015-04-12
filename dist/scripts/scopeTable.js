var Compiler;
(function (Compiler) {
    var ScopeTable = (function () {
        function ScopeTable() {
            this.entryTable = [];

            for (var i = 0; i < _Constants.MAX_SCOPE_ENTRIES; i++) {
                this.entryTable[i] = null;
            }

            this.nextAvailableIndex = 0;

            this.scopeLevel = -1;

            this.parentScope = null;
            this.childScopeList = [];
        }
        ScopeTable.prototype.insertEntry = function (idName, typeInfo, lineNumber) {
            var entry = new Compiler.SymbolTableEntry();
            entry.setEntryNumber(this.nextAvailableIndex++);
            entry.setIdName(idName);
            entry.setIdType(typeInfo);
            entry.setLineNumber(lineNumber);

            var hashIndex = this.hashID(idName);

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

        // Checks if id is in the symbol table; if it is, it links the AST to that symbol table entry
        ScopeTable.prototype.hasEntry = function (idName, astNode) {
            // Check current scope
            var currentScope = this;
            var idFound = false;

            while (currentScope !== null && !idFound) {
                var hashIndex = this.hashID(idName);

                if (this.entryTable[hashIndex] === null) {
                    Compiler.Logger.log("Not in this table level: " + currentScope.getScopeLevel() + ".");
                    currentScope = currentScope.getParent();
                } else {
                    Compiler.Logger.log(idName + " is in table level: " + currentScope.getScopeLevel());

                    var entry = this.entryTable[hashIndex];
                    astNode.setSymbolTableEntry(entry);

                    idFound = true;
                }
            }

            return idFound;
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
