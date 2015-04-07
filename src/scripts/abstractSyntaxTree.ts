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
	VarDecl:
		Interior node if VarDecl
		Children:
			Left: type
			Right: variable
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

		public insertInteriorNode(value: string): void {

			// TODO: Remove after testing
			Logger.log("Inserting interior node: " + value, "ast");

			var node: ASTNode = new ASTNode();
			node.setValue(value);
			node.setNodeType(treeNodeTypes.INTERIOR);

			if(this.root === null) {

				node.setTreeLevel(0);

				this.root = node;
				this.currentNode = node;
			}

			else {

				var nextLevel: number = this.currentNode.getTreeLevel() + 1;
				node.setTreeLevel(nextLevel);

				this.currentNode.addChild(node);
				this.currentNode = node;
			}
		}

		public addLeafNode(): void {

			// TODO: Remove after testing
			Logger.log("Not implemented yet", "ast");
			Logger.log("Inserting leaf node", "ast");

		}

		public moveToParent(): void {

			if(this.currentNode !== this.root) {

				var parent: ASTNode = this.currentNode.getParent();

				if(parent !== null) {

					Logger.log("Moving to parent");
					this.currentNode = parent;
				}

				else {

					var errorMessage: string = "Error! Current AST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

					Logger.log(errorMessage);
					throw errorMessage;
				}
			}
		}

		public printPreOrder(): void {

			// TODO: Remove after testing
			Logger.log("", "ast");
			Logger.log("Displaying AST", "ast");
			Logger.log("----------------------", "ast");

			this.root.printPreOrder(this.root);
		}

	}


	class ASTNode {

		private value: string;
		private typeInfo: string;

		private nodeType: string;
		private treeLevel: number;

		private leftmostSibling: ASTNode;
		private rightSibling: ASTNode;
		private parent: ASTNode;

		private childList: ASTNode [];

		constructor() {

			this.value = "";
			this.typeInfo = "";

			this.treeLevel = 0;

			this.leftmostSibling = null;
			this.rightSibling = null;
			this.parent = null;

			this.childList = [];
		}

		public getValue(): string {
			return this.value;
		}

		public setValue(value: string): void {
			this.value = value;
		}

		public getTypeInfo(): string {
			return this.typeInfo;
		}

		public setTypeInfo(typeInfo: string): void {
			this.typeInfo = typeInfo;
		}

		public getNodeType(): string {
			return this.nodeType;
		}

		public setNodeType(nodeType): void {
			this.nodeType = nodeType;
		}

		public getTreeLevel(): number {
			return this.treeLevel;
		}

		public setTreeLevel(treeLevel): void {
			this.treeLevel = treeLevel;
		}

		public getLeftmostSibling(): ASTNode {
			return this.leftmostSibling;
		}

		public setLeftmostSibling(leftmostSibling: ASTNode): void {
			this.leftmostSibling = leftmostSibling;
		}

		public getRightSibling(): ASTNode {
			return this.rightSibling;
		}

		public setRightSibling(rightSibling: ASTNode): void {
			this.rightSibling = rightSibling;
		}

		public getParent(): ASTNode {
			return this.parent;
		}

		public setParent(parent: ASTNode): void {
			this.parent = parent;
		}

		public addChild(child: ASTNode): void {

			child.setParent(this);
			this.childList.push(child);
		}

		public printPreOrder(root: ASTNode): void {

			if(root !== null) {

				var indentDashes: string = "";
				var treeLevel: number = root.getTreeLevel();

				for(var i: number = 0; i < treeLevel; i++) {
					indentDashes += "-";
				}

				// Interior node
				if(root.getNodeType() === treeNodeTypes.INTERIOR) {
					Logger.log(indentDashes + "< " + root.getValue() + " >", "ast");
				}

				// Leaf node
				else {
					Logger.log(indentDashes + "[ " + root.getValue() + " ]", "ast");
				}

				for(var i: number = 0; i < root.childList.length; i++) {
					root.printPreOrder(root.childList[i]);
				}
			}
		}

	}
}