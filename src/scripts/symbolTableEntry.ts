module Compiler {

	export class SymbolTableEntry {

		private entryNumber: number;
		private value: string;
		private identifierType: string;

		constructor() {

			this.entryNumber = -1;
			this.value = "";
			this.identifierType = "";
		}

		public getEntryNumber(): number {
			return this.entryNumber;
		}

		public setEntryNumber(entryNumber: number): void {
			this.entryNumber = entryNumber;
		}

		public getValue(): string {
			return this.value;
		}

		public setValue(value: string): void {
			this.value = value;
		}

		public getIdentifierType(): string {
			return this.identifierType;
		}

		public setIdentifierType(identifierType: string): void {
			this.identifierType = identifierType;
		}

		// TODO: Make this different
		public toString(): string {

			return "";
		}

	}
}