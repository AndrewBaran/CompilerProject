// Global, constants, and other functions used in the compiler

// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad(): void {

	Compiler.Control.clearData();
	Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList = [
	{name: "Minimal", code: "{ } $"},
	{name: "Declaration", code: "{\n\tint x\n} $"},
	{name: "Assignment", code: "{\n\tint a\n\ta = 1\n\tprint(a)\n} $"},
	{name: "Print", code: "{\n\tprint(1)\n} $"},
	{name: "String 1", code: "{\n\tstring s\n\ts = \"abcde\"\n} $"},
	{name: "String 2", code: "{\n\tstring s\n\ts = \"a b c d e\"\n} $"},
	{name: "String 3", code: "{\n\tstring s\n\ts = \"\"\n} $"},
	{name: "Addition 1", code: "{\n\tint a\n\ta = 4\n\n\tint b\n\tb = 2 + a\n} $"},
	{name: "Addition 2", code: "{\n\tint a\n\ta = 1 + 2 + 3 + 4 + 5\n} $"},
	{name: "If 1", code: "{\n\tif true {\n\t\tint a\n\t\ta = 1\n\t}\n} $"},
	{name: "If 2", code: "{\n\tif (1 == 1) {\n\t\tint a\n\t\ta = 1\n\t}\n} $"},
	{name: "If 3", code: "{\n\tif (1 != 2) {\n\t\tint a\n\t\ta = 1\n\t}\n} $"},
    {name: "While 1", code: "{\n\tint x\n\tx = 0\n\n\twhile false {\n\t\tx = 1 + x\n\t}\n} $"},
    {name: "While 2", code: "{\n\tint x\n\tx = 0\n\n\twhile (x != 5) {\n\t\tx = 1 + x\n\t}\n} $"},
    {name: "Boolean 1", code: "{\n\tboolean b\n\tb = true\n\tb = false\n} $"},
    {name: "Boolean 2", code: "{\n\tboolean b\n\tb = (true == true)\n\tb = (false != false)\n} $"} 
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
	T_CHAR,
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