module Compiler {
	
	export class Token {

		private type: TokenType;
		private value: string;

		constructor() {
			this.type = TokenType.T_DEFAULT;
			this.value = "";
		}

		public getType(): TokenType {
			return this.type;
		}

		public setType(type: TokenType): void {
			this.type = type;
		}

		public setValue(value: string): void {
			this.value = value;
		}

		public getValue(): string {
			return this.value;
		}

		public getTokenName(): string {

			return TokenType[this.type];
		}

	}
}