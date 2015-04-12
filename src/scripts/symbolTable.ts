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

		public insertEntry(idName: string, typeInfo: string, lineNumber: number): boolean {

			var result: boolean = this.currentScopeTable.insertEntry(idName, typeInfo, lineNumber);
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

			else {
				
				var errorMessage: string = "Error! Attempt was made to move to nonexistant parent scope.";

				Logger.log(errorMessage);
				throw errorMessage;
			}
		}

		public getCurrentScope(): ScopeTable {
			return this.currentScopeTable;
		}

		public hasEntry(idName: string, astNode: ASTNode): boolean {
            
            var result: boolean = this.currentScopeTable.hasEntry(idName, astNode);
            return result;
		}

	}
}