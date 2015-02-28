module Compiler {

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

	export class SymbolTable {

		private currentScopeTable: ScopeTable;


		constructor() {

			this.currentScopeTable = null;
		}

		public insertEntry(token: Token): boolean {

			var result: boolean = false;

			if(token.getType() === TokenType.T_ID) {
				result = this.currentScopeTable.insertEntry(token);
			}

			else {

				Logger.log("Error! Attempt to insert " + token.getTokenName() + " into symbol table was made.");
				result = false;
			}

			return result;
		}

		// TODO: Implement
		public openScope(): void {

			Logger.log("Opening new scope");
		}

		// TODO: Implement
		public closeScope(): void {

			Logger.log("Closing current scope");
		}



	}


	class ScopeTable {

		private entryTable: SymbolTableEntry [];
		private nextAvailableIndex: number;

		private scopeLevel: number;

		private parentScope: ScopeTable;
		private childrenScopeList: ScopeTable[];

		constructor() {

			this.entryTable = [];
			this.nextAvailableIndex = 0;

			this.scopeLevel = 0;

			this.parentScope = null;
			this.childrenScopeList = [];
		}

		public insertEntry(token: Token): boolean {

			var entry: SymbolTableEntry = new SymbolTableEntry();
			entry.setEntryNumber(this.nextAvailableIndex++);
			entry.setValue(token.getValue());

			var idType: string = "";

			switch(token.getType()) {

				case TokenType.T_INT:

					idType = "int";
					break;

				case TokenType.T_STRING:
				
					idType = "string";
					break;

				case TokenType.T_BOOLEAN:
				
					idType = "boolean";
					break;
			}

			entry.setIdentifierType(idType);

			// See if id already is in table
			Logger.log("ID name: " + entry.getValue())

			if(this.entryTable) {

			}

			this.entryTable.push(entry);

			return true;
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

		public setParent(parentScope: ScopeTable): void {
			this.parentScope = parentScope;
		}
	}
}