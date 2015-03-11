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

		public insertLeafNode(token: Token): void {

			var node: CSTNode = new CSTNode();
			node.setType(token.getTokenName());
			node.setValue(token.getValue());

			if(this.root === null) {

				node.setTreeLevel(0);

				this.root = node;
				this.currentNode = node;
			}

			else {

				var nextLevel: number = this.currentNode.getTreeLevel() + 1;
				node.setTreeLevel(nextLevel);

				this.currentNode.addChild(node);
			}

		}

		public preOrderTraversal(): void {
			this.root.preOrderTraversal(this.root);
		}

		public moveToParent(): void {

			var parent: CSTNode = this.currentNode.getParent();

			if(parent !== null) {
				this.currentNode = this.currentNode.getParent();
			}

			else {

				var errorMessage: string = "Error! Current CST node (" + this.currentNode.getValue() + ") does not have a parent to move to.";

				Logger.log(errorMessage);
				throw errorMessage;
			}

		}

	} // CST


	class CSTNode {

		private type: string;
		private value: string;

		private treeLevel: number;

		private parent: CSTNode;
		private childList: CSTNode [];

		constructor() {

			this.type = "";
			this.value = "";

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

		public addChild(newNode: CSTNode): void {

			newNode.setParent(this);
			this.childList.push(newNode);
		}

		public preOrderTraversal(root: CSTNode): void {

			if(root !== null) {

				var indentDashes: string = "";
				var treeLevel: number = root.getTreeLevel();

				for(var i: number = 0; i < treeLevel; i++) {
					indentDashes += "-";
				}

				// Interior node
				if(root.childList.length > 0) {
					Logger.log(indentDashes + "< " + root.getValue() + " >", "cst");
				}

				// Leaf node
				else {
					Logger.log(indentDashes + "[ " + root.getValue() + " ]", "cst");
				}

				for(var i: number = 0; i < root.childList.length; i++) {
					root.preOrderTraversal(root.childList[i]);
				}
			}
		}

	}
}