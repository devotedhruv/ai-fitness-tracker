from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import datetime

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        code = 'ERROR'
        message = 'An error occurred'

        if response.status_code == 400:
            code = 'VALIDATION_ERROR'
            message = 'Input validation failed'
        elif response.status_code == 401:
            code = 'UNAUTHORIZED'
            message = 'Invalid or expired credentials'
        elif response.status_code == 403:
            code = 'FORBIDDEN'
            message = 'You do not have permission to access this resource'
        elif response.status_code == 404:
            code = 'NOT_FOUND'
            message = 'Resource not found'
        elif response.status_code == 409:
            code = 'CONFLICT'
            message = 'Conflict with existing resource'

        custom_data = {
            'code': code,
            'message': message,
            'details': response.data,
        }
        response.data = custom_data

    return response
