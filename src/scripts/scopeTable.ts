module Compiler {
	
	export class ScopeTable {

		private entryTable: SymbolTableEntry [];
		private nextAvailableIndex: number;

		private scopeLevel: number;

		private parentScope: ScopeTable;
		private childScopeList: ScopeTable[];

		constructor() {

			this.entryTable = [];

			// Fill with null instead of undefined (the default)
			for(var i: number = 0; i < _Constants.MAX_SCOPE_ENTRIES; i++) {
				this.entryTable[i] = null;
			}

			this.nextAvailableIndex = 0;

			this.scopeLevel = -1;

			this.parentScope = null;
			this.childScopeList = [];
		}

		public insertEntry(idName: string, typeInfo: string, lineNumber: number): boolean {

			var entry: SymbolTableEntry = new SymbolTableEntry();
			entry.setEntryNumber(this.nextAvailableIndex++);
			entry.setIdName(idName);
			entry.setIdType(typeInfo);
            entry.setLineNumber(lineNumber);

			var hashIndex: number = this.hashID(idName);

			if(this.entryTable[hashIndex] === null) {

                Logger.log("Inserting id " + idName + " from line " + lineNumber + " into symbol table");

				this.entryTable[hashIndex] = entry;
				return true;
			}

			else {
				return false;
			}

		}

		private hashID(idName: string): number {

			var firstLowerCaseValue: number = 97;

			var hashValue: number = idName.charCodeAt(0);
			hashValue = hashValue - firstLowerCaseValue;

			return hashValue;
		}

		// Checks if id is in the symbol table; if it is, it links the AST to that symbol table entry
		public hasEntry(idName: string, astNode: ASTNode, optionalPath?: string): boolean {

            var currentScope: ScopeTable = this;
            var idFound: boolean = false;

            Logger.log("Checking if id " + idName + " is in the symbol table");

            while(currentScope !== null && !idFound) {

	            var hashIndex: number = this.hashID(idName);

	            if(currentScope.entryTable[hashIndex] === null) {
                    currentScope = currentScope.getParent();
	            }

	            else {

                    Logger.log("The id " + idName + " at the scope level " + currentScope.getScopeLevel() + " was in the symbol table");

                    var entry: SymbolTableEntry = currentScope.entryTable[hashIndex];
                    entry.incrementNumReferences();

                    if(optionalPath === astNodeTypes.ASSIGNMENT_STATEMENT) {
                        entry.setIsInitialized();
                    }

                    var parentNode: ASTNode = astNode.getParent();

                    if(optionalPath !== astNodeTypes.VAR_DECLARATION && parentNode.getValue() !== astNodeTypes.VAR_DECLARATION) {

                        if(!entry.getIsInitialized()) {

                            var warningMessage: string = "Warning! The id " + entry.getIdName() + " on line " + astNode.getLineNumber() + " was used before being initialized first";
                            _semanticWarnings.push(warningMessage);
                        }
                    }

                    astNode.setSymbolTableEntry(entry);

                    idFound = true;
	            }
            }

            return idFound;
		}

		public addChildScope(child: ScopeTable): void {
			this.childScopeList.push(child);
		}

		public getEntry(entryNumber: number): SymbolTableEntry {

			return this.entryTable[entryNumber];
		}

		public getSize(): number {
			return this.nextAvailableIndex;
		}

		public getScopeLevel(): number {
			return this.scopeLevel;
		}

		public setScopeLevel(scopeLevel): void {
			this.scopeLevel = scopeLevel;
		}

		public getParent(): ScopeTable {
			return this.parentScope;
		}

		public setParent(parentScope: ScopeTable): void {
			this.parentScope = parentScope;
		}

		public getChildList(): ScopeTable [] {
			return this.childScopeList;
		}

        public detectWarnings(currentScopeTable: ScopeTable): void {

            for(var idValue: number = 'a'.charCodeAt(0); idValue <= 'z'.charCodeAt(0); idValue++) {

                var idChar: string = String.fromCharCode(idValue);
                var hashIndex: number = this.hashID(idChar);

                if(currentScopeTable.entryTable[hashIndex] !== null) {

                    var entry: SymbolTableEntry = currentScopeTable.entryTable[hashIndex];

                    if(entry.getNumReferences() === 1) {

                        var warningMessage: string = "Warning! The id " + entry.getIdName() + " declared on line " + entry.getLineNumber() + " was declared, but never used";
                        _semanticWarnings.push(warningMessage);
                    }

                    if(!entry.getIsInitialized()) {

                        var warningMessage: string = "Warning! The id " + entry.getIdName() + " declared on line " + entry.getLineNumber() + " was never initialized";
                        _semanticWarnings.push(warningMessage);
                    }
                }

            }

            for(var i: number = 0; i < currentScopeTable.childScopeList.length; i++) {
                currentScopeTable.detectWarnings(currentScopeTable.childScopeList[i]);
            }
        }

	}
}