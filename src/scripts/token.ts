module Compiler {
	
	export class Token {

		public kind: string;
		public value: string;

		constructor(kind: string, value: string) {
			this.kind = kind;
			this.value = value;
		}

	}
}