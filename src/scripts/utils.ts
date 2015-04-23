module Compiler {
	
	export class Utils {

		public static isIgnoredLeaf(nodeValue: string): boolean {

			var ignoredLeafValues: string [] = ["=", "\"", "+", "(", ")", "print", "==", "!=", "if", "{", "}", "while"];
			var leafMatched: boolean = false;

			for(var i: number = 0; i < ignoredLeafValues.length; i++) {

				if(ignoredLeafValues[i] === nodeValue) {

					leafMatched = true;
					break;
				}
			}

			return leafMatched;
		}

        public static decimalToHex(decimalInput: number): string {

            var hexResult: string = decimalInput.toString(16);

            // Pad if necessary
            if(hexResult.length === 1) {
                hexResult = "0" + hexResult;
            }

            return hexResult.toUpperCase(); 
        }

	}
}