import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    
    // Read sentence from query parameter or body parameter
    const queryText = (req.query.text || (req.body && req.body.text));
    
    let binaryText = text2BinaryString(queryText);
    let intText = text2IntegerString(queryText);
    
    const responseMessage = queryText ? `${binaryText}\n${intText}` : "Try sending some text.";



    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
};

function text2BinaryString(string:string): string {
    return string.split('').map(function (char) {
        return char.charCodeAt(0).toString(2);
    }).join(' ');
}

function text2IntegerString(string:string): string {
    return string.split('').map(function (char) {
        return char.charCodeAt(0).toString();
    }).join(' ');
}

export default httpTrigger;