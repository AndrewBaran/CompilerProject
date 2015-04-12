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
		public hasEntry(idName: string, astNode: ASTNode): boolean {

            var currentScope: ScopeTable = this;
            var idFound: boolean = false;

            while(currentScope !== null && !idFound) {

	            var hashIndex: number = this.hashID(idName);

	            if(currentScope.entryTable[hashIndex] === null) {
                    currentScope = currentScope.getParent();
	            }

	            else {

                    var entry: SymbolTableEntry = currentScope.entryTable[hashIndex];
                    entry.incrementNumReferences();

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

	}
}