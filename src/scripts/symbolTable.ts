module Compiler {

	export class SymbolTable {

		private currentScopeTable: ScopeTable;
		private nextScopeNumber: number;

		private static defaultScopeTable: ScopeTable;

		constructor() {

			this.setDefaultScope();
			this.currentScopeTable = SymbolTable.defaultScopeTable;
			this.nextScopeNumber = 0;
		}

		private setDefaultScope(): void {

			SymbolTable.defaultScopeTable = new ScopeTable();
			SymbolTable.defaultScopeTable.setScopeLevel(-1);
		}

		public insertEntry(token: Token, typeValue: string): boolean {

			var result: boolean = false;

			if(token.getType() === TokenType.T_ID) {
				result = this.currentScopeTable.insertEntry(token, typeValue);
			}

			else {

				Logger.log("Error! Attempt to insert " + token.getTokenName() + " into symbol table was made.");
				result = false;
			}

			return result;
		}

		public openScope(): void {

			var newScope: ScopeTable = new ScopeTable();
			newScope.setParent(this.currentScopeTable);
			newScope.setScopeLevel(this.nextScopeNumber++);

			this.currentScopeTable.addChildScope(newScope);

			this.currentScopeTable = newScope;
		}

		public closeScope(): void {

			var parent: ScopeTable = this.currentScopeTable.getParent();

			if(parent !== null) {
				this.currentScopeTable = parent;
			}
		}

		public getCurrentScope(): ScopeTable {
			return this.currentScopeTable;
		}

	}
}