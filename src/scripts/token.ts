module Compiler {
	
	export class Token {

		public type: TokenType;
		public value: string;

		constructor() {
			this.type = TokenType.T_DEFAULT;
			this.value = "";
		}

	}
}