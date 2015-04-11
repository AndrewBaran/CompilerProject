/*

Game plan:

	AST starts with { } / Block node as root node
	Statements are children of a block node in the order that they are declared
		Children have a link to the leftmost child
		Children have a link to their right sibling (like a B-tree)
		Children have a link to their parent

	VarDecl:
		Interior node of VarDecl
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

		public insertLeafNode(cstNode: CSTNode, newType?: string): void {

			Logger.log("Inserting leaf node: " + cstNode.getValue(), "ast");

			if(this.root === null) {

				var errorMessage: string = "Error! Cannot insert leaf node [ " + node.getValue() + " ] as the root node.";

				Logger.log(errorMessage);
				throw errorMessage;	
			}

			else {

				var node: ASTNode = new ASTNode();

				if(newType !== undefined) {
					node.setTokenType(newType);
				}

				else {
					node.setTokenType(cstNode.getType());
				}

				if(cstNode.getNodeType() === treeNodeTypes.LEAF) {
					node.setLineNumber(cstNode.getLineNumber());
				}

				node.setValue(cstNode.getValue());
				node.setParent(this.currentNode);
				node.setNodeType(treeNodeTypes.LEAF);

				var nextTreeLevel: number = this.currentNode.getTreeLevel() + 1;
				node.setTreeLevel(nextTreeLevel);

				this.currentNode.addChild(node);
			}

		}

		public moveToParent(): void {

			if(this.currentNode !== this.root) {

				var parent: ASTNode = this.currentNode.getParent();

				if(parent !== null) {

					// TODO: Remove after testing
					Logger.log("Moving from " + this.currentNode.getValue() + " to parent: " + parent.getValue(), "ast");
					this.currentNode = parent;
				}

				else {

					var errorMessage: string = "Error! Current AST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

					Logger.log(errorMessage);
					throw errorMessage;
				}
			}
		}

		public getCurrentNode(): ASTNode {
			return this.currentNode;
		}

		public printPreOrder(): void {

			// TODO: Remove after testing
			Logger.log("", "ast");
			Logger.log("Displaying AST", "ast");
			Logger.log("----------------------", "ast");

			this.root.printPreOrder(this.root);
		}

	}


	export class ASTNode {

		private value: string;

		private typeInfo: string;
		private leftTreeType: string;
		private rightTreeType: string;

		private nodeType: string;
		private tokenType: string;

		private treeLevel: number;
		private lineNumber: number;

		private leftmostSibling: ASTNode;
		private rightSibling: ASTNode;
		private parent: ASTNode;

		private childList: ASTNode [];

		constructor() {

			this.value = "";

			this.typeInfo = "";
			this.leftTreeType = "";
			this.rightTreeType = "";

			this.nodeType = "";
			this.tokenType = "";

			this.treeLevel = 0;
			this.lineNumber = -1;

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

		public getLeftTreeType(): string {
			return this.leftTreeType;
		}

		public setLeftTreeType(leftTreeType: string): void {
			this.leftTreeType = leftTreeType;
		}

		public getRightTreeType(): string {
			return this.rightTreeType;
		}

		public setRightTreeType(rightTreeType: string): void {
			this.rightTreeType = rightTreeType;
		}

		public getNodeType(): string {
			return this.nodeType;
		}

		public setNodeType(nodeType): void {
			this.nodeType = nodeType;
		}

		public getTokenType(): string {
			return this.tokenType;
		}

		public setTokenType(tokenType: string): void {
			this.tokenType = tokenType;
		}

		public getTreeLevel(): number {
			return this.treeLevel;
		}

		public setTreeLevel(treeLevel): void {
			this.treeLevel = treeLevel;
		}

		public getLineNumber(): number {
			return this.lineNumber;
		}

		public setLineNumber(lineNumber: number): void {
			this.lineNumber = lineNumber;
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

		public getChildren(): ASTNode [] {
			return this.childList;
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