"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
class CustomerStatementS3Client {
    constructor(bucketNameForCustomerStatements = process.env.CUSTOMER_STATEMENT_BUCKET, bucketNameForContaminatedCustomerStatements = process.env.CUSTOMER_STATEMENT_BUCKET_CONTAINMENT) {
        console.log(`BUKCET NAMES ARE ${bucketNameForCustomerStatements} AND ${bucketNameForCustomerStatements}`);
        this.s3Client = new AWS.S3({ apiVersion: '2006-03-01' });
        this.bucketNameForCustomerStatements = bucketNameForCustomerStatements;
        this.bucketNameForContaminatedCustomerStatements = bucketNameForContaminatedCustomerStatements;
    }
    getCustomerStatement(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                Bucket: this.bucketNameForCustomerStatements,
                Key: key
            };
            return this.s3Client.getObject(request, (err) => {
                if (err) {
                    console.log('Failed to get customer statement with key ' + key);
                }
            }).promise();
        });
    }
    putCustomerStatementInContainment(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getCustomerStatement(key)
                .then(result => {
                const request = {
                    Bucket: this.bucketNameForContaminatedCustomerStatements,
                    Key: key,
                    Body: result.Body
                };
                return this.s3Client.putObject(request, (err) => {
                    if (err) {
                        console.log('Failed to put customer statement with key ' + key + 'in containment');
                    }
                }).promise();
            });
        });
    }
    removeCustomerStatementFromOriginal(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                Bucket: this.bucketNameForCustomerStatements,
                Key: key
            };
            return this.s3Client.deleteObject(request, (err) => {
                if (err) {
                    console.log('Failed to delete customer statement with key ' + key);
                }
            }).promise();
        });
    }
    readCustomerStatementAsString(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getCustomerStatement(key)
                .then(result => {
                const body = result.Body;
                return (body !== undefined) ? body.toString('utf-8') : "";
            });
        });
    }
    createPreSignedUploadUrl(key, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                Expires: 60,
                Bucket: "customer-statements",
                Conditions: [
                    ["content-length-range", 10, 10000000],
                    ["starts-with", "$Content-Type", "text/"] // text/csv OR text/csv
                ],
                Fields: {
                    "Content-Type": contentType,
                    key
                }
            };
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.s3Client.createPresignedPost(params, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            }));
        });
    }
}
exports.default = CustomerStatementS3Client;
//# sourceMappingURL=s3.js.map