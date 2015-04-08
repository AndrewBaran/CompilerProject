module Compiler {

	export class SymbolTableEntry {

		private entryNumber: number;
		private idName: string;
		private idType: string;
		private lineNumber: number;

		constructor() {

			this.entryNumber = -1;
			this.idName = "";
			this.idType = "";
			this.lineNumber = -1;
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

		public getIdType(): string {
			return this.idType;
		}

		public setIdType(idType: string): void {
			this.idType = idType;
		}

		public getLineNumber(): number {
			return this.lineNumber;
		}

		public setLineNumber(lineNumber: number): void {
			this.lineNumber = lineNumber;
		}
	}
}