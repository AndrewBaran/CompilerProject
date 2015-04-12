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

        SymbolTable.prototype.insertEntry = function (idName, typeInfo, lineNumber) {
            var result = this.currentScopeTable.insertEntry(idName, typeInfo, lineNumber);
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
            } else {
                var errorMessage = "Error! Attempt was made to move to nonexistant parent scope.";

                Compiler.Logger.log(errorMessage);
                throw errorMessage;
            }
        };

        SymbolTable.prototype.getCurrentScope = function () {
            return this.currentScopeTable;
        };

        SymbolTable.prototype.hasEntry = function (idName, astNode) {
            var result = this.currentScopeTable.hasEntry(idName, astNode);
            return result;
        };

        SymbolTable.prototype.printWarnings = function () {
            SymbolTable.defaultScopeTable.printWarnings(SymbolTable.defaultScopeTable);
        };
        return SymbolTable;
    })();
    Compiler.SymbolTable = SymbolTable;
})(Compiler || (Compiler = {}));
