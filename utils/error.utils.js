  // Define a custom error class called 'AppError' that extends the built-in 'Error' class
class AppError extends Error {
  // Constructor for the 'AppError' class that takes a 'message' and 'statusCode'
  constructor(message, statusCode) {
      // Call the constructor of the parent 'Error' class with the provided 'message'
      super(message);

      // Set the 'statusCode' property of the error instance to the provided 'statusCode'
      this.statusCode = statusCode;

      // Capture the stack trace for the error instance, which helps with debugging
      Error.captureStackTrace(this, this.constructor);
  }
}

// Export the 'AppError' class to make it available for use in other parts of the code
export default AppError;