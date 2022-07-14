import { AzureFunction, Context, HttpRequest } from "@azure/functions"



const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    
    const queryText = (req.query.text || (req.body && req.body.text));

    if(!queryText){
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Please send me the most primal text you can think of."
        };
        return;
    }
    
    let binaryText = text2BinaryString(queryText);
    let bigIntFromText = binaryText2BigInt(binaryText);
    
    context.log(`text: ${queryText}`)
    context.log(`InputNum: ${bigIntFromText}`)
    const messageInfo = `Binary: ${binaryText}\nNumber: ${bigIntFromText}\n`

    if (isEven(bigIntFromText)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: messageInfo + "Your text is so lame, it's halfable."
        };
        return;
    }
    let responseMessage: string;
    
    // If the text is an odd number begin checking for primality
    let probablyPrime = true;
    if (bigIntFromText % 3n == 0n){
        probablyPrime = false;
    }
    if (bigIntFromText % 5n == 0n){
        probablyPrime = false;
    }

    probablyPrime = millerRabinTest(bigIntFromText,context);
    

    responseMessage = probablyPrime ? `I'm feeling some primality in your text...` : "Your text is inferior.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: messageInfo + responseMessage
    };
};

function text2BinaryString(text: string): string {
    return text.split('').map(function (char) {
        return char.charCodeAt(0).toString(2);
    }).join('');
}

function binaryText2BigInt(binText: string): bigint {
    return BigInt(`0b${binText}`);
}

function isEven(num: bigint): boolean{
    return num % 2n === 0n;
}

function millerRabinTest(num: bigint, context): boolean {
    let probPrime = true;

    const PrimeWitnesses = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n];
    let witnessPointer = 0;

    // Now using Miller-Rabin test
    while(probPrime && witnessPointer < PrimeWitnesses.length){
        // Find n = 2^s * d + 1
        let d = num - 1n;
        let s = 0n;
        while (d % 2n === 0n){
            s++;
            d /= 2n;
        }

        // Pick a random integer 'a' in range [2,n-2]
        // I'm going to be using a list of prime integers up to 100
        // x = a^d mod n
        let a = PrimeWitnesses[witnessPointer];
        if(a >= num - 1n){
            break;
        }
        //context.log(`a:${a} ** d:${d}`);
        //context.log(`= ${a**d}`);
        let x = a**d % num; 
        
        // if x == 1 or x == n-1 then it's maybe prime
        if ( !(x === 1n || x === num-1n) ){
            probPrime = false;
        }

        witnessPointer++;
    }

    return probPrime;
}

export default httpTrigger;