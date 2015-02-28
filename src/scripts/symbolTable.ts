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
		private static defaultScopeTable: ScopeTable;

		constructor() {

			this.setDefaultScope();
			this.currentScopeTable = SymbolTable.defaultScopeTable;
		}

		private setDefaultScope(): void {

			SymbolTable.defaultScopeTable = new ScopeTable();
			SymbolTable.defaultScopeTable.setScopeLevel(-1);
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

		public openScope(): void {

			Logger.log("Opening new scope");

			var newScope: ScopeTable = new ScopeTable();
			newScope.setParent(this.currentScopeTable);
			newScope.setScopeLevel(this.currentScopeTable.getScopeLevel() + 1);

			this.currentScopeTable.addChildScope(newScope);

			this.currentScopeTable = newScope;
		}

		// TODO: Implement
		public closeScope(): void {

			Logger.log("Closing current scope");
		}

		public getCurrentScope(): ScopeTable {
			return this.currentScopeTable;
		}

	}


	export class ScopeTable {

		private entryTable: SymbolTableEntry [];
		private nextAvailableIndex: number;

		private scopeLevel: number;

		private parentScope: ScopeTable;
		private childScopeList: ScopeTable[];

		constructor() {

			this.entryTable = [];
			this.nextAvailableIndex = 0;

			this.scopeLevel = 0;

			this.parentScope = null;
			this.childScopeList = [];
		}

		public insertEntry(token: Token): boolean {

			Logger.log("Inserting into symbol table");

			var entry: SymbolTableEntry = new SymbolTableEntry();
			entry.setEntryNumber(this.nextAvailableIndex++);
			entry.setIdName(token.getValue());

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

			entry.setIdType(idType);

			// See if id already is in table
			Logger.log("ID name: " + entry.getIdName())

			// TODO: Do stuff here
			if(this.entryTable) {

			}

			this.entryTable.push(entry);

			return true;
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

		public setParent(parentScope: ScopeTable): void {
			this.parentScope = parentScope;
		}

		public getChildList(): ScopeTable [] {
			return this.childScopeList;
		}

	}
}