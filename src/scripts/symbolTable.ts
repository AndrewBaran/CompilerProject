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

		public getEntry(entryNumber: number): SymbolTableEntry {

			return this.table[entryNumber];
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

		public getSize(): number {
			return this.nextAvailableIndex;
		}
	}


	// TODO Place in own file?
	export class SymbolTableEntry {

		public entryNumber: number;
		public tokenType: TokenType;
		public tokenValue: string;
		public isReservedWord: boolean;
		public scopeLevel: number;

		constructor() {

			this.entryNumber = -1;
			this.tokenType = TokenType.T_DEFAULT;
			this.tokenValue = "";
			this.isReservedWord = false;
			this.scopeLevel = 0;
		}

		public toString(): string {

			var result = this.entryNumber + " | " + TokenType[this.tokenType] + " | " + this.tokenValue + " | " + this.scopeLevel;
			return result;
		}

	}
}