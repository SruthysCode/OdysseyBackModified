

//customerrors help to create custom erros for operational errors
class CustomError extends Error {
	public status: string;
	public isOperational: boolean;
	public statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.status = statusCode >= 400 && statusCode <= 500 ? "fail" : "error";

		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export default CustomError;
