import CustomerStatementS3Client from "./src/utils/s3";
import {v4 as uuidv4} from "uuid";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult, Handler
} from "aws-lambda";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
};

/**
 * The customer needs to be able to upload the customer statement file to a non public safe place, in our case a non public S3 bucket.
 * This function generates a signed url the client can use to upload the file to the S3 bucket.
 */
const signStatement: Handler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {

    if (event.httpMethod !== 'GET') {
        throw new Error(`only accept GET method is allowed, you tried: ${event.httpMethod}`);
    }

    if (!event.queryStringParameters || !event.queryStringParameters.key || !event.queryStringParameters.contentType) {
        throw new Error('requests must contain a key and contentType query parameter');
    }

    try {
        const preSignedKey: string = `${uuidv4()}_${event.queryStringParameters.key}`;
        const preSignedContentType: string = event.queryStringParameters.contentType;
        const presignedPostData = await new CustomerStatementS3Client()
            .createPreSignedUploadUrl(preSignedKey, preSignedContentType);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                error: false,
                data: presignedPostData,
                message: null
            })
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: true,
                data: null,
                message: error.message
            })
        };
    }
}
export { signStatement }
