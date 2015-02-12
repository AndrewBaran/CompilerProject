module Compiler {
	
	// TODO: Make fields private
	export class Token {

		public type: TokenType;
		public value: string;

		constructor() {
			this.type = TokenType.T_DEFAULT;
			this.value = "";
		}

		public toString(): string {

			var result: string = TokenType[this.type] + ": " + this.value;
			return result;
		}

		public getTokenName(): string {

			return TokenType[this.type];
		}

	}
}