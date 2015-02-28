module Compiler {

	export class SymbolTable {

		private table: SymbolTableEntry [];
		private nextAvailableIndex: number;

		private scopeLevel: number;

		constructor() {

			this.table = [];
			this.nextAvailableIndex = 0;

			this.scopeLevel = 0;
		}

		public insert(token: Token): void {

			var entry: SymbolTableEntry = new SymbolTableEntry();
			entry.setEntryNumber(this.nextAvailableIndex++);
			entry.setTokenType(token.getType());
			entry.setTokenValue(token.getValue());

			this.table.push(entry);
		}

		public getEntry(entryNumber: number): SymbolTableEntry {

			return this.table[entryNumber];
		}

		public getSize(): number {
			return this.nextAvailableIndex;
		}

		public getScopeLevel(): number {
			return this.scopeLevel;
		}

	}
}