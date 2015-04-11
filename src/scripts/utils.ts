module Compiler {
	
	export class Utils {

		public static isIgnoredLeaf(nodeValue: string): boolean {

			var ignoredLeafValues: string [] = ["=", "\"", "+", "(", ")", "print", "==", "!="];
			var leafMatched: boolean = false;

			for(var i: number = 0; i < ignoredLeafValues.length; i++) {

				if(ignoredLeafValues[i] === nodeValue) {

					leafMatched = true;
					break;
				}
			}

			return leafMatched;
		}

	}
}