import * as AWS from 'aws-sdk';
import {
    DeleteObjectOutput,
    DeleteObjectRequest,
    GetObjectOutput,
    GetObjectRequest, PutObjectOutput,
    PutObjectRequest
} from "aws-sdk/clients/s3";

export default class CustomerStatementS3Client {
    bucketNameForCustomerStatements: string;
    bucketNameForContaminatedCustomerStatements: string;
    s3Client: AWS.S3;

    constructor(bucketNameForCustomerStatements: string = (process.env.CUSTOMER_STATEMENT_BUCKET as string),
                bucketNameForContaminatedCustomerStatements: string = (process.env.CUSTOMER_STATEMENT_BUCKET_CONTAINMENT as string)) {
        console.log(`BUCKET NAMES ARE ${bucketNameForCustomerStatements} AND ${bucketNameForCustomerStatements}`)
        this.s3Client = new AWS.S3({apiVersion: '2006-03-01'});
        this.bucketNameForCustomerStatements = bucketNameForCustomerStatements;
        this.bucketNameForContaminatedCustomerStatements = bucketNameForContaminatedCustomerStatements;
    }
    async getCustomerStatement(key: string): Promise<GetObjectOutput> {
        const request: GetObjectRequest = {
            Bucket: this.bucketNameForCustomerStatements,
            Key: key
        };
        return this.s3Client.getObject(request, (err) => {
            if (err) {
                console.log('Failed to get customer statement with key ' + key);
            }
        }).promise();
    }

    async putCustomerStatementInContainment(key: string): Promise<PutObjectOutput> {
        return await this.getCustomerStatement(key)
            .then(result => {
                const request: PutObjectRequest = {
                    Bucket: this.bucketNameForContaminatedCustomerStatements,
                    Key: key,
                    Body: result.Body
                };
                return this.s3Client.putObject(request, (err) => {
                    if (err) {
                        console.log('Failed to put customer statement with key ' + key + 'in containment');
                    }
                }).promise()
            });
    }

    async removeCustomerStatementFromOriginal(key: string): Promise<DeleteObjectOutput> {
        const request: DeleteObjectRequest = {
            Bucket: this.bucketNameForCustomerStatements,
            Key: key
        };
        return this.s3Client.deleteObject(request, (err) => {
            if (err) {
                console.log('Failed to delete customer statement with key ' + key);
            }
        }).promise();
    }

    async readCustomerStatementAsString(key: string): Promise<string> {
        return await this.getCustomerStatement(key)
            .then(result => {
                const body: AWS.S3.Body | undefined = result.Body;
                return (body !== undefined) ? body.toString('utf-8') : "";
            })
            ;
    }

    async createPreSignedUploadUrl(key: string, contentType: string) {
        const params = {
            Expires: 60,
            Bucket: "customer-statements",
            Conditions: [
                ["content-length-range", 10, 10000000], // 100Byte - 1MB
                ["starts-with", "$Content-Type", "text/"] // text/csv OR text/csv
            ],
            Fields: {
                "Content-Type": contentType,
                key
            }
        };
        return new Promise(async (resolve, reject) => {
            this.s3Client.createPresignedPost(params, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }
}
