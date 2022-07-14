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
    
    console.log(`text: ${queryText}`)
    console.log(`InputNum: ${bigIntFromText}`)
    const messageInfo = `Text value: ${bigIntFromText}\n`

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

    probablyPrime = testSimpleDivisions(bigIntFromText);

    if(probablyPrime){
        probablyPrime = millerRabinTest(bigIntFromText);
    }

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

function isEven(num: bigint): boolean {
    return num % 2n === 0n;
}

function testSimpleDivisions(num: bigint): boolean {
    if (num % 3n == 0n){
        return false;
    }
    if (num % 5n == 0n){
        return false;
    }
    if (num % 7n == 0n){
        return false;
    }
    if (num % 11n == 0n){
        return false;
    }
    if (num % 13n == 0n){
        return false;
    }

    return true
}

function millerRabinTest(num: bigint): boolean {
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
        if(a >= num - 2n){
            break;
        }
        console.log(`a:${a}  d:${d}  s:${s}`);

        //let x = a**d % num; 
        let x = bigPowerModulo(a, d, num);

        // if x == 1 or x == n-1 then it's maybe prime
        if ( x == 1n || x == num-1n ){
            probPrime = true;
        }
        else{
            probPrime = false;

            // Repeat s-1 times
            // x = x^2 mod n
            // if x == n - 1 then continue witness loop
            for(let i = 1; i <= s - 1n; i++){
                x = x**2n % num;
                if(x == num - 1n){
                    probPrime = true;
                    break;
                }
            }

        }

        witnessPointer++;
    }

    return probPrime;
}

function bigPowerModulo(base: bigint, power: bigint, mod: bigint): bigint {
    let powerIncrement = 10000n;
    powerIncrement = (power < powerIncrement) ? power : powerIncrement; //if the power is less than this increment, change it to the power.
    let result = base;
    //console.log("increment: " + powerIncrement);
    console.log("witness num: " + result);
    // Num will always be less than mod on first run
    let tally = 0
    while (power > 0){
        //result = (result * (result**powerIncrement % mod)) % mod;
        result = result**powerIncrement % mod;
        //console.log("result: " + result);
        //power = power >= powerIncrement ? power - powerIncrement : power; // If there is enough power left, increment by the power, otherwise just take what is left.
        power = power - powerIncrement;
        //if remaining power is less than the increment, update the incremental power to match power
        powerIncrement = (power >= powerIncrement) ? powerIncrement : power;
        tally++;
        if(tally % 100 == 0){
            console.log("power left: " + power);
        }
    }

    //console.log("result: " + result);

    return result;
}

export default httpTrigger;