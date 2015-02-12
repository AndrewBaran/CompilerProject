module Compiler {
	
	export class Parser {

		private static tokenList: Token[];
		private static currentTokenIndex: number;

		private static symbolTable: SymbolTable;

		private static concreteSyntaxTree: ConcreteSyntaxTree;

		public static parseCode(tokenList: Token[], symbolTable: SymbolTable): ConcreteSyntaxTree {

			this.setupParsingEnvironment(tokenList, symbolTable);

			Logger.log("Parsing the code");
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

		// Program: Block $
		private static parseProgram(): void {

			Logger.log("Parsing Program");

			this.parseBlock();
			this.parseEOF();
		}

		// Block: { StatementList }
		private static parseBlock(): void {

			Logger.log("Parsing Block");

			var token: Token = this.getToken();
			Logger.log("Expecting a left brace");

			if(token.getType() === TokenType.T_LBRACE) {

				this.consumeToken();
				Logger.log("Got a left brace!");

				this.parseStatementList();

				token = this.getToken();
				Logger.log("Expecting a right brace!");

				if(token.getType() === TokenType.T_RBRACE) {

					this.consumeToken();
					Logger.log("Got a right brace!");
				}

				else {

					Logger.log("Error! Expected a right brace, but got a " + token.getTokenName());
				}
			}

			else {

				Logger.log("Error! Expected a left brace, but got a " + token.getTokenName());
			}


		}

		// EOF: $
		private static parseEOF(): void {

			Logger.log("Parsing EOF");

			var token: Token = this.getToken();
			Logger.log("Expecting an EOF");

			if(token.getType() === TokenType.T_EOF) {

				this.consumeToken();
				Logger.log("Got an EOF!");
			}

			else {

				Logger.log("Error! Expected an EOF, but got a " + token.getTokenName());
			}
		}

		// StatementList: Statement StatementList | ""
		private static parseStatementList(): void {

			Logger.log("Parsing StatementList");

			var token: Token = this.getToken();

			// Check for start of statement
			if(token.getType() !== TokenType.T_RBRACE) {

				this.parseStatement();
				this.parseStatementList();
			}
		}

		// Statemment: PrintStatement | AssignmentStatement | VarDecl | WhileStatement | IfStatement | Block
		private static parseStatement(): void {

			Logger.log("Parsing Statement");

			var token: Token = this.getToken();

			// Look at current token and see if it matches a statement
			switch(token.getType()) {

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

					var errorMessage: string = "Error! " + token.getTokenName() + " is not the beginning of any statement";

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		// PrintStatement: print ( Expr )
		private static parsePrintStatement(): void {

			Logger.log("Parsing PrintStatement");

			var token: Token = this.getToken();
			Logger.log("Expecting a print");

			if(token.getType() === TokenType.T_PRINT) {

				this.consumeToken();
				Logger.log("Got a print!");

				token = this.getToken();
				Logger.log("Expecting a left paren");

				if(token.getType() === TokenType.T_LPAREN) {

					this.consumeToken();
					Logger.log("Got a left paren!")

					this.parseExpression();

					token = this.getToken();
					Logger.log("Expecting a right paren");

					if(token.getType() === TokenType.T_RPAREN) {

						this.consumeToken();
						Logger.log("Got a right paren!");
					}

					else {

						var errorMessage: string = "Error! Expected a right paren, but got a " + token.getTokenName();

						Logger.log(errorMessage);
						throw errorMessage;
					}
				}

				else {

					var errorMessage: string = "Error! Expected a left paren, but got a " + token.getTokenName();

					Logger.log(errorMessage);
					throw errorMessage;
				}
			}

			else {

				var errorMessage: string = "Error! Expected a print, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}

		}

		// AssignmentStatement: Id = Expr
		private static parseAssignmentStatement(): void {

			Logger.log("Parsing AssignmentStatement");

		}

		// VarDecl: type Id
		private static parseVariableDeclaration(): void {

			Logger.log("Parsing VariableDeclaration");
		}

		// WhileStatement: while BooleanExpr Block
		private static parseWhileStatement(): void {

			Logger.log("Parsing WhileStatement");
		}

		// IfStatement: if BooleanExpr Block
		private static parseIfStatement(): void {

			Logger.log("Parsing IfStatement");
		}

		// Expr: IntExpr | String Expr | BooleanExpr | Id
		private static parseExpression(): void {

			Logger.log("Parsing Expression");

			// TODO: Debugging for now
			this.consumeToken();
		}

		// IntExpr: digit intop Expr | digit
		private static parseIntExpression(): void {

			Logger.log("Parsing IntExpression");
		}

		// StringExpr: " CharList "
		private static parseStringExpression(): void {

			Logger.log("Parsing StringExpression");
		}

		// BooleanExpr: ( Expr boolop Expr ) | boolval
		private static parseBooleanExpression(): void {

			Logger.log("Parsing BooleanExpression");
		}

		// Id: char
		private static parseId(): void {

			Logger.log("Parsing Id");
		}

		// CharList: char CharList | space CharList | ""
		private static parseCharList(): void {

			Logger.log("Parsing CharList");
		}

		private static getToken(): Token {

			return this.tokenList[this.currentTokenIndex];
		}

		private static consumeToken(): void {

			this.currentTokenIndex++;
		}
	}
}