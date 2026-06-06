from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse


class AppException(HTTPException):
    """Base application exception."""
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundError(AppException):
    """Resource not found."""
    def __init__(self, detail: str = "Resource not found."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class UnauthorizedError(AppException):
    """Authentication required or failed."""
    def __init__(self, detail: str = "Authentication required."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ForbiddenError(AppException):
    """Access denied."""
    def __init__(self, detail: str = "You do not have permission to perform this action."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ValidationError(AppException):
    """Validation failed."""
    def __init__(self, detail: str = "Validation error."):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class ConflictError(AppException):
    """Conflict with existing resource."""
    def __init__(self, detail: str = "Resource already exists."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


def register_exception_handlers(app):
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "status_code": exc.status_code},
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred.", "status_code": 500},
        )
