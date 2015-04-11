module Compiler {
	
	export class Utils {

		public static isIgnoredLeaf(nodeValue: string): boolean {

			var ignoredLeafValues: string [] = ["=", "\""];
			var leafMatched: boolean = false;

			for(var i: number = 0; i < ignoredLeafValues.length; i++) {

				if(ignoredLeafValues[i] === nodeValue) {

					leafMatched = true;
					break;
				}
			}

            // TODO: Remove after testing
            if(leafMatched) {
                Logger.log(nodeValue + " not being added as a leaf.", "ast");
            }

			return leafMatched;
		}

	}
}