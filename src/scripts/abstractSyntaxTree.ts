/*

Game plan:

	AST starts with { } / Block node as root node
	Statements are children of a block node in the order that they are declared
		Children have a link to the leftmost child
		Children have a link to their right sibling (like a B-tree)
		Children have a link to their parent

	Block:
		Interior node of { }
		Move down to new level on tree
	Assignment:
		Interior node of assign
		Children:
			Left: variable
			Right: expression
	Print:
		Interior node of print
		Children:
			Value to be printed / expression
	If:
		Interior node of if
		Child nodes:
			Left: Predicate / boolean expression
			Right: Block node, containing statements
	While:
		Interior node of while
		Child nodes:
			Left: Predicate / boolean expression
			Right: Block node, containing statements

*/


module Compiler {

	export class AbstractSyntaxTree {

		private root: ASTNode;
		private currentNode: ASTNode;

		constructor() {

			this.root = null;
			this.currentNode = null;
		}

		public addInteriorNode(): void {

		}

		public addLeafNode(): void {

		}

		public moveToParent(): void {

		}

	}


	class ASTNode {

		private value: string;
		private type: string;

		private leftmostSibling: ASTNode;
		private rightSibling: ASTNode;
		private parent: ASTNode;

		private childList: ASTNode [];

		constructor() {

			this.value = "";
			this.type = "";

			this.leftmostSibling = null;
			this.rightSibling = null;
			this.parent = null;

			this.childList = [];
		}

		private getValue(): string {
			return this.value;
		}

		private setValue(value: string): void {
			this.value = value;
		}

		private getType(): string {
			return this.type;
		}

		private setType(type: string): void {
			this.type = type;
		}

		private getLeftmostSibling(): ASTNode {
			return this.leftmostSibling;
		}

		private setLeftmostSibling(leftmostSibling: ASTNode): void {
			this.leftmostSibling = leftmostSibling;
		}

	}
}