// Global, constants, and other functions used in the compiler
// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad() {
    Compiler.Control.clearData();
    Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList = [
    { name: "Minimal", code: "{ } $" },
    { name: "Declaration", code: "{\n\tint x\n} $" },
    { name: "Assignment", code: "{\n\tint a\n\ta = 1\n\tprint(a)\n} $" },
    { name: "Print", code: "{\n\tprint(1)\n} $" },
    { name: "Normal String", code: "{\n\tstring s\n\ts = \"abcde\"\n} $" },
    { name: "String with Spaces", code: "{\n\tstring s\n\ts = \"a b c d e\"\n} $" },
    { name: "Addition", code: "{\n\tint a\n\ta = 4\n\n\tint b\n\tb = 2 + a\n\n\tprint(b)\n} $" },
    { name: "If and Increment", code: "{\n\tint i\n\ti = 0\n\n\tprint(i)\n\n\tif (i == 0) {\n\t\ti = 1 + i\n\t}\n\n\tprint(i)\n} $" },
    { name: "If and If", code: "{\n\tif true {\n\t\tprint(\"this will print\")\n\t}\n\n\tif false {\n\t\tprint(\"this will not print\")\n\t}\n} $" },
    { name: "While", code: "{\n\tint x\n\tx = 0\n\n\twhile (x != 5) {\n\t\tprint(x)\n\t\tx = 1 + x\n\t}\n} $" },
    { name: "Tokens", code: "{\n\t{ } ( )\n\twhile if print\n\t\"test string\" 1 2 3 4 5 a b c d e\n\tint string boolean\n\t== != = +\n\tfalse true\n} $" },
    { name: "Boolean", code: "{\n\tif (true) {\n\t\tprint(\"true\")\n\t}\n\n\tif true {\n\t\tprint(\"still true\")\n\t}\n} $" }
];

// Types of each token that the lexer can identify
var TokenType;
(function (TokenType) {
    TokenType[TokenType["T_NO_MATCH"] = 0] = "T_NO_MATCH";
    TokenType[TokenType["T_DEFAULT"] = 1] = "T_DEFAULT";
    TokenType[TokenType["T_LPAREN"] = 2] = "T_LPAREN";
    TokenType[TokenType["T_RPAREN"] = 3] = "T_RPAREN";
    TokenType[TokenType["T_LBRACE"] = 4] = "T_LBRACE";
    TokenType[TokenType["T_RBRACE"] = 5] = "T_RBRACE";
    TokenType[TokenType["T_QUOTE"] = 6] = "T_QUOTE";
    TokenType[TokenType["T_PRINT"] = 7] = "T_PRINT";
    TokenType[TokenType["T_EOF"] = 8] = "T_EOF";
    TokenType[TokenType["T_WHILE"] = 9] = "T_WHILE";
    TokenType[TokenType["T_IF"] = 10] = "T_IF";
    TokenType[TokenType["T_DIGIT"] = 11] = "T_DIGIT";
    TokenType[TokenType["T_ID"] = 12] = "T_ID";
    TokenType[TokenType["T_CHAR"] = 13] = "T_CHAR";
    TokenType[TokenType["T_PLUS"] = 14] = "T_PLUS";
    TokenType[TokenType["T_SPACE"] = 15] = "T_SPACE";
    TokenType[TokenType["T_INT"] = 16] = "T_INT";
    TokenType[TokenType["T_STRING"] = 17] = "T_STRING";
    TokenType[TokenType["T_BOOLEAN"] = 18] = "T_BOOLEAN";
    TokenType[TokenType["T_SINGLE_EQUALS"] = 19] = "T_SINGLE_EQUALS";
    TokenType[TokenType["T_DOUBLE_EQUALS"] = 20] = "T_DOUBLE_EQUALS";
    TokenType[TokenType["T_NOT_EQUALS"] = 21] = "T_NOT_EQUALS";
    TokenType[TokenType["T_FALSE"] = 22] = "T_FALSE";
    TokenType[TokenType["T_TRUE"] = 23] = "T_TRUE";
    TokenType[TokenType["T_WHITE_SPACE"] = 24] = "T_WHITE_SPACE";
})(TokenType || (TokenType = {}));
