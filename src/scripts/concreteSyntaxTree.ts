module Compiler {

	export class ConcreteSyntaxTree {

		private root: CSTNode;
		private currentNode: CSTNode;

		constructor() {

			this.root = null;
			this.currentNode = null;
		}

		public insertInteriorNode(operator: string): void {

			var node: CSTNode = new CSTNode();
			node.setOperator(operator);

			if(this.root === null) {

				this.root = node;
				this.currentNode = node;
			}

			else {

				this.currentNode.addChild(node);
			}
		}

		public insertLeafNode(token: Token): void {

		}

		public preOrderTraversal(): void {

			this.root.preOrderTraversal(this.root);
		}



	}

	// Structs
	class CSTNode {

		private operator: string;

		private parent: CSTNode;
		private childList: CSTNode [];

		constructor() {

			this.operator = "";

			this.parent = null;
			this.childList = [];
		}

		public addChild(newNode: CSTNode): void {

			newNode.setParent(this);
			this.childList.push(newNode);
		}

		public setOperator(operator: string): void {
			this.operator = operator;
		}

		public setParent(parent: CSTNode): void {
			this.parent = parent;
		}

		public preOrderTraversal(root: CSTNode): void {


		}


	}
}