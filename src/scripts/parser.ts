module Compiler {
	
	export class Parser {

		private static tokenList: TokenInfo[];
		private static currentTokenIndex: number;

		private static concreteSyntaxTree: ConcreteSyntaxTree;

		public static parseCode(tokenList: TokenInfo[]): ConcreteSyntaxTree {

			this.setupParsingEnvironment(tokenList);

			Logger.log("Parsing the code");
			Logger.log("");

			this.parseProgram();

			Logger.log("Parsing done");
			Logger.log("");

			return this.concreteSyntaxTree;
		}

		private static setupParsingEnvironment(tokenList: TokenInfo[]): void {

			this.tokenList = tokenList;
			this.currentTokenIndex = 0;

			this.concreteSyntaxTree = new ConcreteSyntaxTree();
		}

		// Program: Block $
		private static parseProgram(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.PROGRAM);

			this.parseBlock();
			this.parseEOF();
		}

		// Block: { StatementList }
		private static parseBlock(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.BLOCK);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting a left brace");

			if(token.getType() === TokenType.T_LBRACE) {

				this.consumeToken();
				Logger.log("Got a left brace!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				this.parseStatementList();

				tokenInfo = this.getTokenInfo();
				token = tokenInfo.token;
				Logger.log("Expecting a right brace!");

				if(token.getType() === TokenType.T_RBRACE) {

					this.consumeToken();
					Logger.log("Got a right brace!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);
				}

				else {
					this.errorExpectedActual(TokenType.T_RBRACE, token.getType());
				}
			}

			else {
				this.errorExpectedActual(TokenType.T_LBRACE, token.getType());
			}

			this.concreteSyntaxTree.moveToParent();

		}

		// EOF: $
		private static parseEOF(): void {

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting an EOF");

			if(token.getType() === TokenType.T_EOF) {

				this.consumeToken();
				Logger.log("Got an EOF!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);
			}

			else {
				this.errorExpectedActual(TokenType.T_EOF, token.getType());
			}
		}

		// StatementList: Statement StatementList | ""
		private static parseStatementList(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.STATEMENT_LIST);

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

			this.concreteSyntaxTree.moveToParent();
		}

		// Statemment: PrintStatement | AssignmentStatement | VarDecl | WhileStatement | IfStatement | Block
		private static parseStatement(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.STATEMENT);

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

			this.concreteSyntaxTree.moveToParent();
		}

		// PrintStatement: print ( Expr )
		private static parsePrintStatement(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.PRINT_STATEMENT);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting a print");

			if(token.getType() === TokenType.T_PRINT) {

				this.consumeToken();
				Logger.log("Got a print!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				tokenInfo = this.getTokenInfo();
				token = tokenInfo.token;
				Logger.log("Expecting a left paren");

				if(token.getType() === TokenType.T_LPAREN) {

					this.consumeToken();
					Logger.log("Got a left paren!")

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					this.parseExpression();

					tokenInfo = this.getTokenInfo();
					token = tokenInfo.token;
					Logger.log("Expecting a right paren");

					if(token.getType() === TokenType.T_RPAREN) {

						this.consumeToken();
						Logger.log("Got a right paren!");

						this.concreteSyntaxTree.insertLeafNode(tokenInfo);
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

			this.concreteSyntaxTree.moveToParent();
		}

		// AssignmentStatement: Id = Expr
		private static parseAssignmentStatement(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.ASSIGNMENT_STATEMENT);

			this.parseId();

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting an = ");

			if(token.getType() === TokenType.T_SINGLE_EQUALS) {

				this.consumeToken();
				Logger.log("Got a = !");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				this.parseExpression();
			}

			else {
				this.errorExpectedActual(TokenType.T_SINGLE_EQUALS, token.getType());
			}

			this.concreteSyntaxTree.moveToParent();
		}

		// VarDecl: type Id
		private static parseVariableDeclaration(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.VAR_DECLARATION);

			this.parseType();
			this.parseId();

			this.concreteSyntaxTree.moveToParent();
		}

		// WhileStatement: while BooleanExpr Block
		private static parseWhileStatement(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.WHILE_STATEMENT);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting a while");

			if(token.getType() === TokenType.T_WHILE) {

				this.consumeToken();
				Logger.log("Got a while!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				this.parseBooleanExpression();
				this.parseBlock();
			}

			else {
				this.errorExpectedActual(TokenType.T_WHILE, token.getType());
			}

			this.concreteSyntaxTree.moveToParent();
		}

		// IfStatement: if BooleanExpr Block
		private static parseIfStatement(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.IF_STATEMENT);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting an if");

			if(token.getType() === TokenType.T_IF) {

				this.consumeToken();
				Logger.log("Got an if!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				this.parseBooleanExpression();
				this.parseBlock();
			}

			else {
				this.errorExpectedActual(TokenType.T_IF, token.getType());
			}

			this.concreteSyntaxTree.moveToParent();
		}

		// Expr: IntExpr | String Expr | BooleanExpr | Id
		private static parseExpression(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.EXPRESSION);

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

			this.concreteSyntaxTree.moveToParent();
		}

		// IntExpr: digit intop Expr | digit
		private static parseIntExpression(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.INT_EXPRESSION);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting a digit");

			if(token.getType() === TokenType.T_DIGIT) {

				this.consumeToken();
				Logger.log("Got a digit!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				var intOpExisted: boolean = this.parseIntOperator();

				if(intOpExisted) {
					this.parseExpression();
				}

			}

			else {
				this.errorExpectedActual(TokenType.T_DIGIT, token.getType());
			}

			this.concreteSyntaxTree.moveToParent();
		}

		// StringExpr: " CharList "
		private static parseStringExpression(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.STRING_EXPRESSION);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting a quotation mark");

			if(token.getType() === TokenType.T_QUOTE) {

				this.consumeToken();
				Logger.log("Got a quotation mark!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				this.parseCharList();

				tokenInfo = this.getTokenInfo();
				token = tokenInfo.token;
				Logger.log("Expecting a quotation mark");

				if(token.getType() === TokenType.T_QUOTE) {

					this.consumeToken();
					Logger.log("Got a quotation mark!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);
				}

				else {
					this.errorExpectedActual(TokenType.T_QUOTE, token.getType());
				}
			}

			else {
				this.errorExpectedActual(TokenType.T_QUOTE, token.getType());
			}

			this.concreteSyntaxTree.moveToParent();
		}

		// BooleanExpr: ( Expr boolop Expr ) | boolval
		private static parseBooleanExpression(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.BOOLEAN_EXPRESSION);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Potentially expecting a left paren, true, or false");

			switch(token.getType()) {

				case TokenType.T_LPAREN:

					this.consumeToken();
					Logger.log("Got a left paren!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					this.parseExpression();
					this.parseBooleanOperator();
					this.parseExpression();

					tokenInfo = this.getTokenInfo();
					token = tokenInfo.token;
					Logger.log("Expecting a right paren");

					if(token.getType() === TokenType.T_RPAREN) {

						this.consumeToken();
						Logger.log("Got a right paren!");

						this.concreteSyntaxTree.insertLeafNode(tokenInfo);
					}

					else {
						this.errorExpectedActual(TokenType.T_RPAREN, token.getType());
					}

					break;

				case TokenType.T_TRUE:

					this.consumeToken();
					Logger.log("Got a true!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					break;

				case TokenType.T_FALSE:

					this.consumeToken();
					Logger.log("Got a false!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					break;

				default:

					var errorMessage: string = "Error on line " + token.getTokenName() + ": " + token.getTokenName() + " is not the beginning of any boolean expression";

					Logger.log(errorMessage);
					throw errorMessage;

					break;

			}

			this.concreteSyntaxTree.moveToParent();
		}

		// int | string | boolean
		private static parseType(): void {

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting a type");

			switch(token.getType()) {

				case TokenType.T_INT:

					this.consumeToken();
					Logger.log("Got an int type!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					break;

				case TokenType.T_STRING:

					this.consumeToken();
					Logger.log("Got a string type!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					break;

				case TokenType.T_BOOLEAN:

					this.consumeToken();
					Logger.log("Got a boolean type!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					break;

				default:

					this.errorExpectedActual(TokenType.T_TYPE, token.getType());
					break;
			}
		}

		// Id: char
		private static parseId(): void {

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Expecting an id");

			if(token.getType() === TokenType.T_ID) {

				this.consumeToken();
				Logger.log("Got an id!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);
			}

			else {
				this.errorExpectedActual(TokenType.T_ID, token.getType());
			}
		}

		// CharList: char CharList | space CharList | ""
		private static parseCharList(): void {

			this.concreteSyntaxTree.insertInteriorNode(cstNodeTypes.CHAR_LIST);

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Potentially expecting a string character");

			if(token.getType() === TokenType.T_CHAR || token.getType() === TokenType.T_WHITE_SPACE) {

				this.consumeToken();
				Logger.log("Got a string character!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				this.parseCharList();
			}

			else {
				// Epsilon case
			}

			this.concreteSyntaxTree.moveToParent();
		}

		// +
		private static parseIntOperator(): boolean {

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 
			Logger.log("Potentially expecting a plus operator");

			if(token.getType() === TokenType.T_PLUS) {

				this.consumeToken();
				Logger.log("Got a plus operator!");

				this.concreteSyntaxTree.insertLeafNode(tokenInfo);

				return true;
			}

			else {

				return false;
			}

		}

		// == | !=
		private static parseBooleanOperator(): void {

			var tokenInfo: TokenInfo = this.getTokenInfo();
			var token: Token = tokenInfo.token; 

			switch(token.getType()) {

				case TokenType.T_DOUBLE_EQUALS:

					this.consumeToken();
					Logger.log("Got a double equals!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);

					break;

				case TokenType.T_NOT_EQUALS:

					this.consumeToken();
					Logger.log("Got a not equals!");

					this.concreteSyntaxTree.insertLeafNode(tokenInfo);
					
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

		private static consumeToken(): void {

			this.currentTokenIndex++;
		}

		private static getTokenLineNumber(): number {

			var lineNumber: number = this.tokenList[this.currentTokenIndex].lineFoundOn;
			return lineNumber;
		}

		private static getTokenInfo(): TokenInfo {

			var tokenInfo: TokenInfo = this.tokenList[this.currentTokenIndex];
			return tokenInfo;
		}

		private static errorExpectedActual(expectedType: TokenType, actualType: TokenType): void {

			var errorMessage: string = "Error on line " + this.getTokenLineNumber() + ": Expected " + TokenType[expectedType] + ", but got " + TokenType[actualType];

			Logger.log(errorMessage);
			throw errorMessage;
		}
	}
}