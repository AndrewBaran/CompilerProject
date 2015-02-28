var Compiler;
(function (Compiler) {
    /* Game Plan
    
    A symbol table is a tree of hash tables:
    Each hash table has a list of entries (ids), a link to its parent (can be null),
    and a list of links to its children
    
    Methods:
    openScope():
    Creates new hash table
    Adds it to current table's list of children
    Move currentTablePointer to the new child
    
    closeScope():
    Move currentTablePointer to its parent
    
    */
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

    var ScopeTable = (function () {
        function ScopeTable() {
            this.entryTable = [];
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

            // TODO: Not currently a hashtable
            // Will want to hash the ordinal value of the char
            if (!(this.hasEntry(entry.getIdName()))) {
                this.entryTable.push(entry);
                return true;
            } else {
                return false;
            }
        };

        ScopeTable.prototype.hasEntry = function (idName) {
            for (var i = 0; i < this.entryTable.length; i++) {
                var entry = this.entryTable[i];

                if (entry.getIdName() === idName) {
                    return true;
                }
            }

            // Not found
            return false;
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
