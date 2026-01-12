export class ApiError extends Error {
    statusCode: number;
    code: string;
    details?: any;

    constructor(statusCode: number, message: string, code: string = 'INTERNAL_ERROR', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
