module Compiler {
	
	export class Parser {

		private static tokenList: Token[];
		private static currentTokenIndex: number;

		private static symbolTable: SymbolTable;

		public static parseCode(tokenList: Token[], symbolTable: SymbolTable): void {

			Logger.log("Parsing the code");

			this.setupParsingEnvironment(tokenList, symbolTable);

			this.parseProgram();
		}

		private static setupParsingEnvironment(tokenList: Token[], symbolTable: SymbolTable): void {

			this.tokenList = tokenList;
			this.symbolTable = symbolTable;

			this.currentTokenIndex = 0;
		}

		private static parseProgram(): void {

			this.parseBlock();
			this.parseEOF();
		}

		private static parseBlock(): void {

			Logger.log("Expecting a left brace");

			var token: Token = this.getToken();

			if(token.type === TokenType.T_LBRACE) {

				Logger.log("Got a left brace!");

				this.consumeToken();
				this.parseStatementList();

				token = this.getToken();

				Logger.log("Expecting a right brace!");

				if(token.type === TokenType.T_RBRACE) {

					Logger.log("Got a right brace");

					this.consumeToken();
				}

				else {

					Logger.log("Error! Expected a right brace, but got a " + token.getTokenName());
				}
			}

			else {

				Logger.log("Error! Expected a left brace, but got a " + token.getTokenName());
			}


		}

		private static parseEOF(): void {

			Logger.log("Expecting an EOF");

			var token: Token = this.getToken();

			if(token.type === TokenType.T_EOF) {

				Logger.log("Got an EOF!");

				this.consumeToken();
			}

			else {

				Logger.log("Error! Expected an EOF, but got a " + token.getTokenName());
			}
		}

		private static parseStatementList(): void {

		}

		private static getToken(): Token {

			return this.tokenList[this.currentTokenIndex];
		}

		private static consumeToken(): void {

			this.currentTokenIndex++;
		}
	}
}