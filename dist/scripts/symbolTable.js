var Compiler;
(function (Compiler) {
    var SymbolTable = (function () {
        function SymbolTable() {
            this.setDefaultScope();
            this.currentScopeTable = SymbolTable.defaultScopeTable;
            this.nextScopeNumber = 0;
        }
        SymbolTable.prototype.setDefaultScope = function () {
            SymbolTable.defaultScopeTable = new Compiler.ScopeTable();
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
            var newScope = new Compiler.ScopeTable();
            newScope.setParent(this.currentScopeTable);
            newScope.setScopeLevel(this.nextScopeNumber++);

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
})(Compiler || (Compiler = {}));
