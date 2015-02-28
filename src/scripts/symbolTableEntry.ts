module Compiler {

	export class SymbolTableEntry {

		private entryNumber: number;
		private tokenType: TokenType;
		private tokenValue: string;
		private identifierType: string;

		constructor() {

			this.entryNumber = -1;
			this.tokenType = TokenType.T_DEFAULT;
			this.tokenValue = "";
			this.identifierType = "";
		}

		public getEntryNumber(): number {
			return this.entryNumber;
		}

		public setEntryNumber(entryNumber: number): void {
			this.entryNumber = entryNumber;
		}

		public getTokenType(): TokenType {
			return this.tokenType;
		}

		public setTokenType(tokenType: TokenType): void {
			this.tokenType = tokenType;
		}

		public getTokenValue(): string {
			return this.tokenValue;
		}

		public setTokenValue(tokenValue: string): void {
			this.tokenValue = tokenValue;
		}

		public getIdentifierType(): string {
			return this.identifierType;
		}

		public setIdentifierType(identifierType: string): void {
			this.identifierType = identifierType;
		}

		public toString(): string {

			var token: Token = new Token();
			token.setType(this.tokenType);
			token.setValue(this.tokenValue);

			var result = this.entryNumber + " | " + token.getTokenName() + " | " + token.getValue();
			return result;
		}

	}
}