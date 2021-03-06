// Globals, constants, and other functions used by the compiler
// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad() {
    Compiler.Control.clearData();
    Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList = [
    { name: "Minimal", code: "{ } $" },
    { name: "Declarations", code: "{\n\tint x\n\tstring s\n\tboolean b\n} $" },
    { name: "Assignment 1", code: "{\n\tint a\n\ta = 1\n} $" },
    { name: "Assignment 2", code: "{\n\tint a\n\ta = 1\n\n\tint b\n\tb = 2\n\n\ta = b\n\tb = a\n} $" },
    { name: "Print 1", code: "{\n\tprint(1)\n} $" },
    { name: "Print 2", code: "{\n\tprint(\"hello world\")\n} $" },
    { name: "Print 3", code: "{\n\tprint(true)\n} $" },
    { name: "Print 4", code: "{\n\tint a\n\ta = 5\n\n\tprint(a)\n} $" },
    { name: "String 1", code: "{\n\tstring s\n\ts = \"\"\n} $" },
    { name: "String 2", code: "{\n\tstring s\n\ts = \"abcde\"\n} $" },
    { name: "String 3", code: "{\n\tstring s\n\ts = \"a b c d e\"\n} $" },
    { name: "Addition 1", code: "{\n\tint a\n\ta = 4\n\n\tint b\n\tb = 2 + a\n} $" },
    { name: "Addition 2", code: "{\n\tint a\n\ta = 1 + 2 + 3 + 4 + 5\n} $" },
    { name: "If 1", code: "{\n\tif true {\n\t\tint a\n\t\ta = 1\n\t}\n} $" },
    { name: "If 2", code: "{\n\tif (1 == 1) {\n\t\tint a\n\t\ta = 1\n\t}\n} $" },
    { name: "If 3", code: "{\n\tif (1 != 2) {\n\t\tint a\n\t\ta = 1\n\t}\n} $" },
    { name: "If 4", code: "{\n\tint a\n\ta = 1\n\n\tif(a == 1) {\n\t\ta = 2\n\t}\n\n\tif(a != 1) {\n\t\ta = 3\n\t}\n} $" },
    { name: "While 1", code: "{\n\tint x\n\tx = 0\n\n\twhile (x != 5) \n\t{\n\t\tprint(x)\n\t\tx = 1 + x\n\t}\n} $" },
    { name: "Infinite Loop", code: "{\n\tint x\n\tx = 0\n\n\twhile true {\n\t\tx = 1 + x\n\t\tprint(x)\n\t}\n} $" },
    { name: "Boolean 1", code: "{\n\tboolean b\n\tb = true\n\tb = false\n} $" },
    { name: "Boolean 2", code: "{\n\tboolean b\n\tb = (true == true)\n\tb = (false != false)\n} $" },
    { name: "Boolean 3", code: "{\n\tboolean b\n\tb = (true == (true != (false == false)))\n} $" },
    { name: "Boolean 4", code: "{\n\tint a\n\ta = 1\n\n\tboolean b\n\tb = (true == (true != (false == (true != (false != (a == a))))))\n\n\tprint(b)\n} $" },
    { name: "Boolean 5", code: "{\n\tboolean b\n\tb = ((true == false) != (true == true))\n\tprint(b)\n}$" },
    { name: "Scope 1", code: "{\n\tint a\n\ta = 1\n\n\tint b\n\tb = 2\n\n\t{\n\t\tint c\n\n\t\tc = 3\n\t\ta = 8\n\t\tb = 9\n\t}\n} $" },
    { name: "Scope 2", code: "{\n\tint x\n\tx = 1\n\n\t{\n\n\t\tint x\n\t\tx = 2\n\n\t\t{\n\t\t\tx = 5\n\t\t}\n\n\t\tprint(x)\n\t}\n\n\tprint(x)\n} $" }
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
    TokenType[TokenType["T_TYPE"] = 16] = "T_TYPE";
    TokenType[TokenType["T_INT"] = 17] = "T_INT";
    TokenType[TokenType["T_STRING"] = 18] = "T_STRING";
    TokenType[TokenType["T_BOOLEAN"] = 19] = "T_BOOLEAN";
    TokenType[TokenType["T_SINGLE_EQUALS"] = 20] = "T_SINGLE_EQUALS";
    TokenType[TokenType["T_DOUBLE_EQUALS"] = 21] = "T_DOUBLE_EQUALS";
    TokenType[TokenType["T_NOT_EQUALS"] = 22] = "T_NOT_EQUALS";
    TokenType[TokenType["T_EXCLAMATION_POINT"] = 23] = "T_EXCLAMATION_POINT";
    TokenType[TokenType["T_FALSE"] = 24] = "T_FALSE";
    TokenType[TokenType["T_TRUE"] = 25] = "T_TRUE";
    TokenType[TokenType["T_WHITE_SPACE"] = 26] = "T_WHITE_SPACE";
    TokenType[TokenType["T_STRING_EXPRESSION"] = 27] = "T_STRING_EXPRESSION";
})(TokenType || (TokenType = {}));

var treeNodeTypes = {
    INTERIOR: "Interior",
    LEAF: "LEAF"
};

var cstNodeTypes = {
    PROGRAM: "Program",
    BLOCK: "Block",
    STATEMENT_LIST: "Statement List",
    STATEMENT: "Statement",
    PRINT_STATEMENT: "Print Statement",
    ASSIGNMENT_STATEMENT: "Assignment Statement",
    VAR_DECLARATION: "Variable Declaration",
    WHILE_STATEMENT: "While Statement",
    IF_STATEMENT: "If Statement",
    EXPRESSION: "Expression",
    INT_EXPRESSION: "Int Expression",
    STRING_EXPRESSION: "String Expression",
    BOOLEAN_EXPRESSION: "Boolean Expression",
    CHAR_LIST: "Char List"
};

var astNodeTypes = {
    BLOCK: "BLOCK",
    VAR_DECLARATION: "Variable Declaration",
    ASSIGNMENT_STATEMENT: "Assignment Statement",
    PRINT_STATEMENT: "Print Statement",
    STRING_EXPRESSION: "String Expression",
    IF_STATEMENT: "If Statement",
    WHILE_STATEMENT: "While Statement",
    ADD: "Add",
    DIGIT: "Digit",
    EQUAL: "Equal",
    NOT_EQUAL: "Not Equal",
    BOOLEAN_EXPRESSION: "Boolean Expression"
};

var types = {
    INT: "int",
    STRING: "string",
    BOOLEAN: "boolean"
};

var _Constants = { MAX_SCOPE_ENTRIES: 26, MAX_CODE_SIZE: 256 };

var _semanticWarnings = [];
