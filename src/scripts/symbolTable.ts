module Compiler {


	export class SymbolTable {

		private table: SymbolTableEntry [];
		private nextAvailableIndex: number;

		constructor() {

			// Populate the table with reserved words
			var reservedWordList: string[] = ["while", "if", "print", "int", "string", "boolean", "false", "true", "!=", "=", "=="];

			this.table = [];

			for(var i: number = 0; i < reservedWordList.length; i++) {

				var entry: SymbolTableEntry = new SymbolTableEntry();
				entry.entryNumber = this.nextAvailableIndex++;
				entry.tokenValue = reservedWordList[i];
				entry.isReservedWord = true;

				this.table.push(entry);
			}
		}

		public insert(token: Token): void {

			var entry: SymbolTableEntry = new SymbolTableEntry();
			entry.entryNumber = this.nextAvailableIndex++;
			entry.tokenType = token.type;
			entry.tokenValue = token.value;
			entry.isReservedWord = false;

			this.table.push(entry);
		}

		public hasReservedWordPrefix(inputWord: string): boolean {

			for(var i: number = 0; i < this.table.length; i++) {

				var currentEntry: SymbolTableEntry = this.table[i];

				if(currentEntry.isReservedWord) {

					// Prefix found
					if(currentEntry.tokenValue.indexOf(inputWord) === 0) {

						return true;
					}
				}

			}

			return false;
		}
	}


	export class SymbolTableEntry {

		public entryNumber: number;
		public tokenType: TokenType;
		public tokenValue: string; // String?
		public isReservedWord: boolean;

		constructor() {
			
		}
	}
}