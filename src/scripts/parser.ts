// TODO: Make error message function, something like
// private static errorExpectedActual(expected: TokenType, actual: TokenType): void
// private static errorInvalidStart(tokenName: TokenType): void

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

					var errorMessage: string = "Error! Expected a right brace, but got a " + token.getTokenName();

					Logger.log(errorMessage);
					throw errorMessage;
				}
			}

			else {

				var errorMessage: string = "Error! Expected a left brace, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
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

				var errorMessage: string = "Error! Expected an EOF, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
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

			this.parseId();

			var token: Token = this.getToken();
			Logger.log("Expecting an = ");

			if(token.getType() === TokenType.T_SINGLE_EQUALS) {

				this.consumeToken();
				Logger.log("Got a = !");

				this.parseExpression();
			}

			else {

				var errorMessage: string = "Error! Expected an =, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}

		}

		// VarDecl: type Id
		private static parseVariableDeclaration(): void {

			Logger.log("Parsing VariableDeclaration");

			this.parseType();
			this.parseId();
		}

		// WhileStatement: while BooleanExpr Block
		private static parseWhileStatement(): void {

			Logger.log("Parsing WhileStatement");

			var token: Token = this.getToken();
			Logger.log("Expecting a while");

			if(token.getType() === TokenType.T_WHILE) {

				this.consumeToken();
				Logger.log("Got a while!");

				this.parseBooleanExpression();
				this.parseBlock();
			}

			else {

				var errorMessage: string = "Error! Expected a while, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}
		}

		// IfStatement: if BooleanExpr Block
		private static parseIfStatement(): void {

			Logger.log("Parsing IfStatement");

			var token: Token = this.getToken();
			Logger.log("Expecting an if");

			if(token.getType() === TokenType.T_IF) {

				this.consumeToken();
				Logger.log("Got an if!");

				this.parseBooleanExpression();
				this.parseBlock();
			}

			else {

				var errorMessage: string = "Error! Expected an if, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}
		}

		// Expr: IntExpr | String Expr | BooleanExpr | Id
		private static parseExpression(): void {

			Logger.log("Parsing Expression");

			var token: Token = this.getToken();

			switch(token.getType()) {

				case TokenType.T_DIGIT:

					this.parseIntExpression();
					break;

				case TokenType.T_QUOTE:

					this.parseStringExpression();
					break;

				case TokenType.T_LPAREN:
				case TokenType.T_TRUE:
				case TokenType.T_FALSE:

					this.parseBooleanExpression();
					break;

				case TokenType.T_ID:

					this.parseId();
					break;

				default:

					var errorMessage: string = "Error! " + token.getTokenName() + " is not the beginning of any expression";

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		// IntExpr: digit intop Expr | digit
		private static parseIntExpression(): void {

			Logger.log("Parsing IntExpression");

			var token: Token = this.getToken();
			Logger.log("Expecting a digit");

			if(token.getType() === TokenType.T_DIGIT) {

				this.consumeToken();
				Logger.log("Got a digit!");

				var intOpExisted: boolean = this.parseIntOperator();

				if(intOpExisted) {
					this.parseExpression();
				}

			}

			else {

				var errorMessage: string = "Error! Expected a digit, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}
		}

		// StringExpr: " CharList "
		private static parseStringExpression(): void {

			Logger.log("Parsing StringExpression");

			var token: Token = this.getToken();
			Logger.log("Expecting a quotation mark");

			if(token.getType() === TokenType.T_QUOTE) {

				this.consumeToken();
				Logger.log("Got a quotation mark!");

				this.parseCharList();

				token = this.getToken();
				Logger.log("Expecting a quotation mark");

				if(token.getType() === TokenType.T_QUOTE) {

					this.consumeToken();
					Logger.log("Got a quotation mark!");
				}

				else {

					var errorMessage: string = "Error! Expected a quotation mark, but got a " + token.getTokenName();

					Logger.log(errorMessage);
					throw errorMessage;
				}
			}

			else {

				var errorMessage: string = "Error! Expected a quotation mark, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}

		}

		// BooleanExpr: ( Expr boolop Expr ) | boolval
		private static parseBooleanExpression(): void {

			Logger.log("Parsing BooleanExpression");

			var token: Token = this.getToken();
			Logger.log("Potentially expecting a left paren or true or false");

			switch(token.getType()) {

				case TokenType.T_LPAREN:

					this.consumeToken();
					Logger.log("Got a left paren!");

					this.parseExpression();
					this.parseBooleanOperator();
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

					break;

				case TokenType.T_TRUE:

					this.consumeToken();
					Logger.log("Got a true!");

					break;

				case TokenType.T_FALSE:

					this.consumeToken();
					Logger.log("Got a false!");

					break;

				default:

					var errorMessage: string = "Error! " + token.getTokenName() + " is not the beginning of any boolean expression";

					Logger.log(errorMessage);
					throw errorMessage;

					break;

			}
		}

		// int | string | boolean
		private static parseType(): void {

			Logger.log("Parsing Type");

			var token: Token = this.getToken();
			Logger.log("Expecting a type");

			switch(token.getType()) {

				case TokenType.T_INT:

					this.consumeToken();
					Logger.log("Got an int type!");

					break;

				case TokenType.T_STRING:

					this.consumeToken();
					Logger.log("Got a string type!");

					break;

				case TokenType.T_BOOLEAN:

					this.consumeToken();
					Logger.log("Got a boolean type!");

					break;

				default:

					var errorMessage: string = "Error! Expected a type, but got a " + token.getTokenName();

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		// Id: char
		private static parseId(): void {

			Logger.log("Parsing Id");

			var token: Token = this.getToken();
			Logger.log("Expecting an id");

			if(token.getType() === TokenType.T_ID) {

				this.consumeToken();
				Logger.log("Got an id!");
			}

			else {

				var errorMessage: string = "Error! Expected an id, but got a " + token.getTokenName();

				Logger.log(errorMessage);
				throw errorMessage;
			}
		}

		// CharList: char CharList | space CharList | ""
		private static parseCharList(): void {

			Logger.log("Parsing CharList");

			var token: Token = this.getToken();
			Logger.log("Potentially expecting a string character");

			if(token.getType() === TokenType.T_CHAR || token.getType() === TokenType.T_WHITE_SPACE) {

				this.consumeToken();
				Logger.log("Got a string character!");

				this.parseCharList();
			}
		}

		private static parseIntOperator(): boolean {

			Logger.log("Parsing IntOperator");

			var token: Token = this.getToken();
			Logger.log("Potentially expecting a plus operator");

			if(token.getType() === TokenType.T_PLUS) {

				this.consumeToken();
				Logger.log("Got a plus operator!");

				return true;
			}

			else {

				return false;
			}

		}

		private static parseBooleanOperator(): void {

			Logger.log("Parsing BooleanOperator");

			var token: Token = this.getToken();

			switch(token.getType()) {

				case TokenType.T_DOUBLE_EQUALS:

					this.consumeToken();
					Logger.log("Got a double equals!");

					break;

				case TokenType.T_NOT_EQUALS:

					this.consumeToken();
					Logger.log("Got a not equals!");

					break;

				default:

					var errorMessage: string = "Error! " + token.getTokenName() + " is not a valid boolean operator."; 

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		private static getToken(): Token {

			var token: Token = this.tokenList[this.currentTokenIndex];
			return token; 
		}

		private static consumeToken(): void {

			this.currentTokenIndex++;
		}
	}
}