module Compiler {

	export class SymbolTableEntry {

		private entryNumber: number;
		private idName: string;
		private value: string;
		private idType: string;

		constructor() {

			this.entryNumber = -1;
			this.idName = "";
			this.value = "";
			this.idType = "";
		}

		public getEntryNumber(): number {
			return this.entryNumber;
		}

		public setEntryNumber(entryNumber: number): void {
			this.entryNumber = entryNumber;
		}

		public getIdName(): string {
			return this.idName;
		}

		public setIdName(idName: string): void {
			this.idName = idName;
		}

		public getValue(): string {
			return this.value;
		}

		public setValue(value: string): void {
			this.value = value;
		}

		public getIdType(): string {
			return this.idType;
		}

		public setIdType(idType: string): void {
			this.idType = idType;
		}

		// TODO: Make this different
		public toString(): string {

			return "";
		}

	}
}