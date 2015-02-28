module Compiler {
	
	export class Parser {

		private static tokenList: TokenInfo[];
		private static currentTokenIndex: number;

		private static symbolTable: SymbolTable;

		private static concreteSyntaxTree: ConcreteSyntaxTree;

		public static parseCode(tokenList: TokenInfo[], symbolTable: SymbolTable): ConcreteSyntaxTree {

			this.setupParsingEnvironment(tokenList, symbolTable);

			Logger.log("Parsing the code");
			Logger.log("");

			this.parseProgram();

			Logger.log("Parsing done");
			Logger.log("");

			return this.concreteSyntaxTree;
		}

		private static setupParsingEnvironment(tokenList: TokenInfo[], symbolTable: SymbolTable): void {

			this.tokenList = tokenList;
			this.symbolTable = symbolTable;

			this.currentTokenIndex = 0;

			this.concreteSyntaxTree = new ConcreteSyntaxTree();
		}

		// Program: Block $
		private static parseProgram(): void {

			this.parseBlock();
			this.parseEOF();
		}

		// Block: { StatementList }
		private static parseBlock(): void {

			var token: Token = this.getToken();
			Logger.log("Expecting a left brace");

			if(token.getType() === TokenType.T_LBRACE) {

				this.consumeToken();
				Logger.log("Got a left brace!");

				this.symbolTable.openScope();

				this.parseStatementList();

				token = this.getToken();
				Logger.log("Expecting a right brace!");

				if(token.getType() === TokenType.T_RBRACE) {

					this.consumeToken();
					Logger.log("Got a right brace!");

					this.symbolTable.closeScope();
				}

				else {
					this.errorExpectedActual(TokenType.T_RBRACE, token.getType());
				}
			}

			else {
				this.errorExpectedActual(TokenType.T_LBRACE, token.getType());
			}

		}

		// EOF: $
		private static parseEOF(): void {

			var token: Token = this.getToken();
			Logger.log("Expecting an EOF");

			if(token.getType() === TokenType.T_EOF) {

				this.consumeToken();
				Logger.log("Got an EOF!");
			}

			else {
				this.errorExpectedActual(TokenType.T_EOF, token.getType());
			}
		}

		// StatementList: Statement StatementList | ""
		private static parseStatementList(): void {

			var token: Token = this.getToken();

			switch(token.getType()) {

				// First set for statements
				case TokenType.T_PRINT:
				case TokenType.T_ID:
				case TokenType.T_INT:
				case TokenType.T_STRING:
				case TokenType.T_BOOLEAN:
				case TokenType.T_WHILE:
				case TokenType.T_IF:
				case TokenType.T_LBRACE:

					this.parseStatement();
					this.parseStatementList();

					break;

				default:

					// Epsilon case
					break;

			}
		}

		// Statemment: PrintStatement | AssignmentStatement | VarDecl | WhileStatement | IfStatement | Block
		private static parseStatement(): void {

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

					var errorMessage: string = "Error on line " + this.getTokenLineNumber() + ": " + token.getTokenName() + " is not the beginning of any statement";

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		// PrintStatement: print ( Expr )
		private static parsePrintStatement(): void {

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
						this.errorExpectedActual(TokenType.T_RPAREN, token.getType());
					}
				}

				else {
					this.errorExpectedActual(TokenType.T_LPAREN, token.getType());
				}
			}

			else {
				this.errorExpectedActual(TokenType.T_PRINT, token.getType());
			}

		}

		// AssignmentStatement: Id = Expr
		private static parseAssignmentStatement(): void {

			this.parseId();

			var token: Token = this.getToken();
			Logger.log("Expecting an = ");

			if(token.getType() === TokenType.T_SINGLE_EQUALS) {

				this.consumeToken();
				Logger.log("Got a = !");

				this.parseExpression();
			}

			else {
				this.errorExpectedActual(TokenType.T_SINGLE_EQUALS, token.getType());
			}

		}

		// TODO: It's not getting the type of the id
		// VarDecl: type Id
		private static parseVariableDeclaration(): void {

			this.parseType();
			this.parseId();

			var previousIDToken: Token = this.getPreviousToken();

			var result: boolean = this.symbolTable.insertEntry(previousIDToken);
		}

		// WhileStatement: while BooleanExpr Block
		private static parseWhileStatement(): void {

			var token: Token = this.getToken();
			Logger.log("Expecting a while");

			if(token.getType() === TokenType.T_WHILE) {

				this.consumeToken();
				Logger.log("Got a while!");

				this.parseBooleanExpression();
				this.parseBlock();
			}

			else {
				this.errorExpectedActual(TokenType.T_WHILE, token.getType());
			}
		}

		// IfStatement: if BooleanExpr Block
		private static parseIfStatement(): void {

			var token: Token = this.getToken();
			Logger.log("Expecting an if");

			if(token.getType() === TokenType.T_IF) {

				this.consumeToken();
				Logger.log("Got an if!");

				this.parseBooleanExpression();
				this.parseBlock();
			}

			else {
				this.errorExpectedActual(TokenType.T_IF, token.getType());
			}
		}

		// Expr: IntExpr | String Expr | BooleanExpr | Id
		private static parseExpression(): void {

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

					var errorMessage: string = "Error on line " + this.getTokenLineNumber() + ": " + token.getTokenName() + " is not the beginning of any expression";

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		// IntExpr: digit intop Expr | digit
		private static parseIntExpression(): void {

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
				this.errorExpectedActual(TokenType.T_DIGIT, token.getType());
			}
		}

		// StringExpr: " CharList "
		private static parseStringExpression(): void {

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
					this.errorExpectedActual(TokenType.T_QUOTE, token.getType());
				}
			}

			else {
				this.errorExpectedActual(TokenType.T_QUOTE, token.getType());
			}

		}

		// BooleanExpr: ( Expr boolop Expr ) | boolval
		private static parseBooleanExpression(): void {

			var token: Token = this.getToken();
			Logger.log("Potentially expecting a left paren, true, or false");

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
						this.errorExpectedActual(TokenType.T_RPAREN, token.getType());
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

					var errorMessage: string = "Error on line " + token.getTokenName() + ": " + token.getTokenName() + " is not the beginning of any boolean expression";

					Logger.log(errorMessage);
					throw errorMessage;

					break;

			}
		}

		// int | string | boolean
		private static parseType(): void {

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

					this.errorExpectedActual(TokenType.T_TYPE, token.getType());
					break;
			}
		}

		// Id: char
		private static parseId(): void {

			var token: Token = this.getToken();
			Logger.log("Expecting an id");

			if(token.getType() === TokenType.T_ID) {

				this.consumeToken();
				Logger.log("Got an id!");
			}

			else {
				this.errorExpectedActual(TokenType.T_ID, token.getType());
			}
		}

		// CharList: char CharList | space CharList | ""
		private static parseCharList(): void {

			var token: Token = this.getToken();
			Logger.log("Potentially expecting a string character");

			if(token.getType() === TokenType.T_CHAR || token.getType() === TokenType.T_WHITE_SPACE) {

				this.consumeToken();
				Logger.log("Got a string character!");

				this.parseCharList();
			}

			else {
				// Epsilon case
			}
		}

		// +
		private static parseIntOperator(): boolean {

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

		// == | !=
		private static parseBooleanOperator(): void {

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

					var errorMessage: string = "Error on line " + this.getTokenLineNumber() + ": " + token.getTokenName() + " is not a valid boolean operator."; 

					Logger.log(errorMessage);
					throw errorMessage;

					break;
			}
		}

		private static getToken(): Token {

			var token: Token = this.tokenList[this.currentTokenIndex].token;
			return token; 
		}

		private static getPreviousToken(): Token {

			var token: Token = this.tokenList[this.currentTokenIndex - 1].token;
			return token;
		}

		private static consumeToken(): void {

			this.currentTokenIndex++;
		}

		private static getTokenLineNumber(): number {

			var lineNumber: number = this.tokenList[this.currentTokenIndex].lineFoundOn;
			return lineNumber;
		}

		private static errorExpectedActual(expectedType: TokenType, actualType: TokenType): void {

			var errorMessage: string = "Error on line " + this.getTokenLineNumber() + ": Expected " + TokenType[expectedType] + ", but got " + TokenType[actualType];

			Logger.log(errorMessage);
			throw errorMessage;
		}
	}
}