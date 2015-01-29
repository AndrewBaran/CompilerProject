// Global, constants, and other functions used in the compiler
// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad() {
    Compiler.Control.clearData();
    Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList = [
    "{\n\tint a\n\ta = 10\n\tprint(a)\n} $",
    "{\n\tstring s\n\ts = \"This is a string\"\n\tprint(s)\n} $",
    "{\n\tint a\n\ta = 40\n\n\tint b\n\tb = 2 + a\n\n\tprint(b)\n} $",
    "{\n\tint i\n\ti = 0\n\n\tprint(i)\n\n\tif (i == 0) {\n\t\ti = 1 + i\n\t}\n\n\tprint(i)\n} $",
    "{\n\tif true {\n\t\tprint(\"This will print\")\n\t}\n\n\tif false {\n\t\tprint(\"This will not print\")\n\t}\n} $",
    "{\n\tint x\n\tx = 0\n\n\twhile (x != 5) {\n\t\tprint(x)\n\t\tx = 1 + x\n\t}\n}"
];
