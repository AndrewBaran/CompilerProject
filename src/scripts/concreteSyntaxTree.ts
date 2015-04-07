module Compiler {

	export class ConcreteSyntaxTree {

		private root: CSTNode;
		private currentNode: CSTNode;

		constructor() {

			this.root = null;
			this.currentNode = null;
		}

		public insertInteriorNode(value: string): void {

			var node: CSTNode = new CSTNode();
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

		public insertLeafNode(tokenInfo: TokenInfo): void {

			var token: Token = tokenInfo.token;
			var lineNumber: number = tokenInfo.lineFoundOn;

			var node: CSTNode = new CSTNode();
			node.setType(token.getTokenName());
			node.setValue(token.getValue());
			node.setNodeType(treeNodeTypes.LEAF);
			node.setLineNumber(lineNumber);

			if(this.root === null) {

				var errorMessage: string = "Error! Cannot insert leaf node [ " + node.getValue() + " ] as the root node.";

				Logger.log(errorMessage);
				throw errorMessage;	
			}

			else {

				var nextLevel: number = this.currentNode.getTreeLevel() + 1;
				node.setTreeLevel(nextLevel);

				this.currentNode.addChild(node);
			}

		}

		public printPreOrder(): void {
			this.root.printPreOrder(this.root);
		}

		public moveToParent(): void {

			var parent: CSTNode = this.currentNode.getParent();

			if(parent !== null) {
				this.currentNode = parent; 
			}

			else {

				var errorMessage: string = "Error! Current CST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

				Logger.log(errorMessage);
				throw errorMessage;
			}

		}

		public buildAST(): AbstractSyntaxTree {

			var ast: AbstractSyntaxTree = new AbstractSyntaxTree();

			this.root.buildInOrder(this.root, ast);
			return ast;
		}

	} // CST


	class CSTNode {

		private type: string;
		private value: string;

		private nodeType: string;
		private treeLevel: number;

		private lineNumber: number;

		private parent: CSTNode;
		private childList: CSTNode [];

		constructor() {

			this.type = "";
			this.value = "";

			this.nodeType = "";
			this.treeLevel = 0;

			this.parent = null;
			this.childList = [];
		}

		public getValue(): string {
			return this.value;
		}

		public setValue(value: string): void {
			this.value = value;
		}

		public getType(): string {
			return this.type;
		}

		public setType(type: string): void {
			this.type = type;
		}

		public getParent(): CSTNode {
			return this.parent;
		}

		public setParent(parent: CSTNode): void {
			this.parent = parent;
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

		public getNodeType(): string {
			return this.nodeType;
		}

		public setNodeType(nodeType: string): void {
			this.nodeType = nodeType;
		}

		public addChild(child: CSTNode): void {

			child.setParent(this);
			this.childList.push(child);
		}

		public printPreOrder(root: CSTNode): void {

			if(root !== null) {

				var indentDashes: string = "";
				var treeLevel: number = root.getTreeLevel();

				for(var i: number = 0; i < treeLevel; i++) {
					indentDashes += "-";
				}

				// Interior node
				if(root.getNodeType() === treeNodeTypes.INTERIOR) {
					Logger.log(indentDashes + "< " + root.getValue() + " >", "cst");
				}

				// Leaf node
				else {
					Logger.log(indentDashes + "[ " + root.getValue() + " ]", "cst");
				}

				for(var i: number = 0; i < root.childList.length; i++) {
					root.printPreOrder(root.childList[i]);
				}
			}
		}

		public buildInOrder(root: CSTNode, abstractSyntaxTree: AbstractSyntaxTree): void {

			if(root !== null) {

				var wentDownALevel: boolean = true;

				switch(root.getValue()) {

					case cstNodeTypes.BLOCK:

						abstractSyntaxTree.insertInteriorNode(astNodeTypes.BLOCK);
						break;

					default:

						wentDownALevel = false;
						break;
				}

				for(var i: number = 0; i < root.childList.length; i++) {
					root.buildInOrder(root.childList[i], abstractSyntaxTree);
				}

				if(wentDownALevel) {
					abstractSyntaxTree.moveToParent();
				}
			}
		}
	}
}