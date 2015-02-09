// Global, constants, and other functions used in the compiler

// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad(): void {

	Compiler.Control.clearData();
	Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList = [
	{name: "Minimal", code: "{ } $"},
	{name: "Simple", code: "{\n\tint x\n} $"},
	{name: "Assignment", code: "{\n\tint a\n\ta = 1\n\tprint(a)\n} $"},
	{name: "String", code: "{\n\tstring s\n\ts = \"this is a string\"\n\tprint(s)\n} $"},
	{name: "Addition", code: "{\n\tint a\n\ta = 4\n\n\tint b\n\tb = 2 + a\n\n\tprint(b)\n} $"},
	{name: "If and Increment", code: "{\n\tint i\n\ti = 0\n\n\tprint(i)\n\n\tif (i == 0) {\n\t\ti = 1 + i\n\t}\n\n\tprint(i)\n} $"},
    {name: "If-else", code: "{\n\tif true {\n\t\tprint(\"this will print\")\n\t}\n\n\tif false {\n\t\tprint(\"this will not print\")\n\t}\n} $"},
    {name: "While", code: "{\n\tint x\n\tx = 0\n\n\twhile (x != 5) {\n\t\tprint(x)\n\t\tx = 1 + x\n\t}\n} $"},
    {name: "Tokens", code: "{\n\t{ } ( )\n\twhile if print\n\t\" \" 1 2 3 4 5 a b c d e\n\tint string boolean\n\t== != = +\n\tfalse true\n} $"},
    {name: "Boolean", code: "{\n\tif (true) {\n\t\tprint(\"true\")\n\t}\n\n\tif true {\n\t\tprint(\"still true\")\n\t}\n} $"}
];

// Types of each token that the lexer can identify
enum TokenType {
	T_NO_MATCH,
	T_DEFAULT,
	T_LPAREN, // (
	T_RPAREN, // )
	T_LBRACE, // {
	T_RBRACE, // }
	T_QUOTE, // "
	T_PRINT, // print
	T_EOF, // $
	T_WHILE, // while
	T_IF, // if
	T_DIGIT, // 0-9
	T_ID, // a-z
	T_PLUS, // +
	T_SPACE, // ' '
	T_INT, // int
	T_STRING, // string
	T_BOOLEAN, // bool
	T_SINGLE_EQUALS, // =
	T_DOUBLE_EQUALS, // ==
	T_NOT_EQUALS, // !=
	T_FALSE, // false
	T_TRUE, // true
	T_WHITE_SPACE
}