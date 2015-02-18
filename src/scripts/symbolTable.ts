module Compiler {

	export class SymbolTable {

		private table: SymbolTableEntry [];
		private nextAvailableIndex: number;

		constructor() {

			// Populate the table with reserved words
			var reservedWordList: string[] = ["while", "if", "print", "int", "string", "boolean", "false", "true", "!=", "=", "=="];

			this.table = [];
			this.nextAvailableIndex = 0;

			for(var i: number = 0; i < reservedWordList.length; i++) {

				var entry: SymbolTableEntry = new SymbolTableEntry();
				entry.setEntryNumber(this.nextAvailableIndex++);
				entry.setTokenValue(reservedWordList[i]);
				entry.setReservedWord(true);

				this.table.push(entry);
			}
		}

		public insert(token: Token): void {

			var entry: SymbolTableEntry = new SymbolTableEntry();
			entry.setEntryNumber(this.nextAvailableIndex++);
			entry.setTokenType(token.getType());
			entry.setTokenValue(token.getValue());
			entry.setReservedWord(false);

			this.table.push(entry);
		}

		public getEntry(entryNumber: number): SymbolTableEntry {

			return this.table[entryNumber];
		}

		public getSize(): number {
			return this.nextAvailableIndex;
		}

	}
}