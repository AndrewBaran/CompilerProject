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
            this.currentScopeTable = null;
        }
        SymbolTable.prototype.insertEntry = function (token) {
            var result = false;

            if (token.getType() === 12 /* T_ID */) {
                result = this.currentScopeTable.insertEntry(token);
            } else {
                Compiler.Logger.log("Error! Attempt to insert " + token.getTokenName() + " into symbol table was made.");
                result = false;
            }

            return result;
        };

        // TODO: Implement
        SymbolTable.prototype.openScope = function () {
            Compiler.Logger.log("Opening new scope");
        };

        // TODO: Implement
        SymbolTable.prototype.closeScope = function () {
            Compiler.Logger.log("Closing current scope");
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
            this.childrenScopeList = [];
        }
        ScopeTable.prototype.insertEntry = function (token) {
            var entry = new Compiler.SymbolTableEntry();
            entry.setEntryNumber(this.nextAvailableIndex++);
            entry.setValue(token.getValue());

            var idType = "";

            switch (token.getType()) {
                case 17 /* T_INT */:
                    idType = "int";
                    break;

                case 18 /* T_STRING */:
                    idType = "string";
                    break;

                case 19 /* T_BOOLEAN */:
                    idType = "boolean";
                    break;
            }

            entry.setIdentifierType(idType);

            // See if id already is in table
            Compiler.Logger.log("ID name: " + entry.getValue());

            if (this.entryTable) {
            }

            this.entryTable.push(entry);

            return true;
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

        ScopeTable.prototype.setParent = function (parentScope) {
            this.parentScope = parentScope;
        };
        return ScopeTable;
    })();
})(Compiler || (Compiler = {}));
