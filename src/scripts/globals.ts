// Global, constants, and other functions used in the compiler

// Sets up the browser environment for the compiler when the page is loaded
function onDocumentLoad() {

	Compiler.Control.clearData();
	Compiler.Control.createTestButtons();
}

// Used to dynamically set up the test code in the form of buttons
var _testCodeList: string [] = [
	"int a\na = 10",
	"int b\nb = 20",
	"int c\nc = 30"
];