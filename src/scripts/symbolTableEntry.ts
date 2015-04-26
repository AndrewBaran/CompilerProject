module Compiler {

	export class SymbolTableEntry {

		private entryNumber: number;
		private idName: string;
		private idType: string;
		private lineNumber: number;
        private scopeLevel: number;

        private isInitialized: boolean;

        private numReferences: number;

		constructor() {

			this.entryNumber = -1;
			this.idName = "";
			this.idType = "";
			this.lineNumber = -1;
            this.scopeLevel = -1;

            this.isInitialized = false;

            this.numReferences = 0;
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

        public getScopeLevel(): number {
            return this.scopeLevel;
        }

        public setScopeLevel(scopeLevel: number): void {
            this.scopeLevel = scopeLevel;
        }

		public getIsInitialized(): boolean {
            return this.isInitialized;
		}

		public setIsInitialized(): void {
            this.isInitialized = true;
		}

		public getNumReferences(): number {
            return this.numReferences;
		}

		public incrementNumReferences(): void {
            this.numReferences++;
		}
	}
}