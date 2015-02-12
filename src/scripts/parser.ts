module Compiler {
	
	export class Parser {

		private static tokenList: Token[];
		private static currentTokenIndex: number;

		private static symbolTable: SymbolTable;

		private static concreteSyntaxTree: ConcreteSyntaxTree;

		public static parseCode(tokenList: Token[], symbolTable: SymbolTable): ConcreteSyntaxTree {

			Logger.log("Parsing the code");

			this.setupParsingEnvironment(tokenList, symbolTable);

			this.parseProgram();

			Logger.log("Parsing done");

			return this.concreteSyntaxTree;
		}

		private static setupParsingEnvironment(tokenList: Token[], symbolTable: SymbolTable): void {

			this.tokenList = tokenList;
			this.symbolTable = symbolTable;

			this.currentTokenIndex = 0;

			this.concreteSyntaxTree = new ConcreteSyntaxTree();
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

					Logger.log("Got a right brace!");

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

			var token: Token = this.getToken();

			// Check for start of statement
			if(token.type !== TokenType.T_RBRACE) {

				this.parseStatement();
				this.parseStatementList();
			}
		}

		private static parseStatement(): void {

			var token: Token = this.getToken();

			// Look at current token and see if it matches a statement
			switch(token.type) {

				case TokenType.T_PRINT:
					this.parsePrintStatement();
					break;

				case TokenType.T_ID:
					this.parseAssignmentStatement();
					break;

				case TokenType.T_INT:
				case TokenType.T_STRING:
				case TokenType.T_BOOLEAN:
					this.parseVariableDeclaration();
					break;

				case TokenType.T_WHILE:
					this.parseWhileStatement();
					break;

				case TokenType.T_IF:
					this.parseIfStatement();
					break;

				case TokenType.T_LBRACE:
					this.parseBlock();
					break;

				default:
					Logger.log("Error!");
					throw "Error!";
					break;
			}
		}

		private static parsePrintStatement(): void {

			var token: Token = this.getToken();

			Logger.log("Expecting a print");

			if(token.type === TokenType.T_PRINT) {

				Logger.log("Got a print!");

				this.consumeToken();

				token = this.getToken();

				Logger.log("Expecting a left paren");

				if(token.type === TokenType.T_LPAREN) {

					Logger.log("Got a left paren!")

					this.consumeToken();

					this.parseExpression();

					token = this.getToken();

					Logger.log("Expecting a right paren");

					if(token.type === TokenType.T_RPAREN) {

						Logger.log("Got a right paren!");

						this.consumeToken();
					}

					else {

						Logger.log("Expecting a right paren but got a " + token.getTokenName());
						throw "Error!";
					}
				}

				else {
					Logger.log("Expected a left paren but got a " + token.getTokenName());
					throw "Error!";
				}
			}

			else {

				Logger.log("Expected a print but got a " + token.getTokenName());
				throw "Error!";
			}

		}

		private static parseAssignmentStatement(): void {

		}

		private static parseVariableDeclaration(): void {

		}

		private static parseWhileStatement(): void {

		}

		private static parseIfStatement(): void {

		}

		private static parseExpression(): void {

			// TODO: Debug mode
			this.consumeToken();
		}

		private static getToken(): Token {

			return this.tokenList[this.currentTokenIndex];
		}

		private static consumeToken(): void {

			this.currentTokenIndex++;
		}
	}
}