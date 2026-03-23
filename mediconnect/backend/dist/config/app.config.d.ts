export declare const appConfig: (() => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    frontendUrl: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    frontendUrl: string;
}>;
export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}>;
export declare const jwtConfig: (() => {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
}>;
