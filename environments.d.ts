declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'dev' | 'prod';
            CUSTOMER_STATEMENT_BUCKET: string;
            CUSTOMER_STATEMENT_BUCKET_CONTAINMENT: string;
            CUSTOMER_STATEMENT_TABLE: string;
            CUSTOMER_STATEMENT_APP_REGION: string;
        }
    }
}
export {}
