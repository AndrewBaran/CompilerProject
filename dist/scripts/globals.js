// Global, constants, and other functions used in the compiler
// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad() {
    Compiler.Control.clearData();
    Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList = [
    { name: "Assignment", code: "{\n\tint a\n\ta = 1\n\tprint(a)\n} $" },
    { name: "String", code: "{\n\tstring s\n\ts = \"This is a string\"\n\tprint(s)\n} $" },
    { name: "Addition", code: "{\n\tint a\n\ta = 4\n\n\tint b\n\tb = 2 + a\n\n\tprint(b)\n} $" },
    { name: "If and Increment", code: "{\n\tint i\n\ti = 0\n\n\tprint(i)\n\n\tif (i == 0) {\n\t\ti = 1 + i\n\t}\n\n\tprint(i)\n} $" },
    { name: "If-else", code: "{\n\tif true {\n\t\tprint(\"This will print\")\n\t}\n\n\tif false {\n\t\tprint(\"This will not print\")\n\t}\n} $" },
    { name: "While", code: "{\n\tint x\n\tx = 0\n\n\twhile (x != 5) {\n\t\tprint(x)\n\t\tx = 1 + x\n\t}\n} $" }
];

// Types of each token that the lexer can identify
var TokenType;
(function (TokenType) {
    TokenType[TokenType["T_LPAREN"] = 0] = "T_LPAREN";
    TokenType[TokenType["T_RPAREN"] = 1] = "T_RPAREN";
    TokenType[TokenType["T_LBRACE"] = 2] = "T_LBRACE";
    TokenType[TokenType["T_RBRACE"] = 3] = "T_RBRACE";
    TokenType[TokenType["T_QUOTE"] = 4] = "T_QUOTE";
    TokenType[TokenType["T_PRINT"] = 5] = "T_PRINT";
    TokenType[TokenType["T_EOF"] = 6] = "T_EOF";
    TokenType[TokenType["T_WHILE"] = 7] = "T_WHILE";
    TokenType[TokenType["T_IF"] = 8] = "T_IF";
    TokenType[TokenType["T_DIGIT"] = 9] = "T_DIGIT";
    TokenType[TokenType["T_CHAR"] = 10] = "T_CHAR";
    TokenType[TokenType["T_PLUS"] = 11] = "T_PLUS";
    TokenType[TokenType["T_SPACE"] = 12] = "T_SPACE";
    TokenType[TokenType["T_INT"] = 13] = "T_INT";
    TokenType[TokenType["T_STRING"] = 14] = "T_STRING";
    TokenType[TokenType["T_BOOL"] = 15] = "T_BOOL";
    TokenType[TokenType["T_SINGLE_EQUALS"] = 16] = "T_SINGLE_EQUALS";
    TokenType[TokenType["T_DOUBLE_EQUALS"] = 17] = "T_DOUBLE_EQUALS";
    TokenType[TokenType["T_NOT_EQUALS"] = 18] = "T_NOT_EQUALS";
    TokenType[TokenType["T_FALSE"] = 19] = "T_FALSE";
    TokenType[TokenType["T_TRUE"] = 20] = "T_TRUE";
})(TokenType || (TokenType = {}));
