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
        ScopeTable.prototype.hasEntry = function (idName, astNode, optionalPath) {
            var currentScope = this;
            var idFound = false;

            while (currentScope !== null && !idFound) {
                var hashIndex = this.hashID(idName);

                if (currentScope.entryTable[hashIndex] === null) {
                    currentScope = currentScope.getParent();
                } else {
                    var entry = currentScope.entryTable[hashIndex];
                    entry.incrementNumReferences();

                    if (optionalPath === astNodeTypes.ASSIGNMENT_STATEMENT) {
                        entry.setIsInitialized();
                    }

                    var parentNode = astNode.getParent();

                    if (optionalPath !== astNodeTypes.VAR_DECLARATION && parentNode.getValue() !== astNodeTypes.VAR_DECLARATION) {
                        if (!entry.getIsInitialized()) {
                            var warningMessage = "Warning! The id " + entry.getIdName() + " on line " + astNode.getLineNumber() + " was used before being initialized first";
                            _semanticWarnings.push(warningMessage);
                        }
                    }

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

        ScopeTable.prototype.detectWarnings = function (currentScopeTable) {
            for (var idValue = 'a'.charCodeAt(0); idValue <= 'z'.charCodeAt(0); idValue++) {
                var idChar = String.fromCharCode(idValue);
                var hashIndex = this.hashID(idChar);

                if (currentScopeTable.entryTable[hashIndex] !== null) {
                    var entry = currentScopeTable.entryTable[hashIndex];

                    if (entry.getNumReferences() === 1) {
                        var warningMessage = "Warning! The id " + entry.getIdName() + " declared on line " + entry.getLineNumber() + " was declared, but never used";
                        _semanticWarnings.push(warningMessage);
                    }

                    if (!entry.getIsInitialized()) {
                        var warningMessage = "Warning! The id " + entry.getIdName() + " declared on line " + entry.getLineNumber() + " was never initialized";
                        _semanticWarnings.push(warningMessage);
                    }
                }
            }

            for (var i = 0; i < currentScopeTable.childScopeList.length; i++) {
                currentScopeTable.detectWarnings(currentScopeTable.childScopeList[i]);
            }
        };
        return ScopeTable;
    })();
    Compiler.ScopeTable = ScopeTable;
})(Compiler || (Compiler = {}));
