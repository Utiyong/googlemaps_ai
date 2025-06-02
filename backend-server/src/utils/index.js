// This file contains utility functions that can be used throughout the application.

export const formatMessage = (text, isUser) => {
  return {
    text,
    isUser,
    timestamp: new Date().toISOString(),
  };
};

export const handleError = (error) => {
  console.error(error);
  return {
    message: "An error occurred. Please try again later.",
    details: error.message,
  };
};