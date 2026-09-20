from fastapi import APIRouter
from app.api.v1 import (
    auth, families, members, verification, schemes, eligibility, applications, benefits, notifications, mock_gov
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(families.router)
api_router.include_router(members.router)
api_router.include_router(verification.router)
api_router.include_router(schemes.router)
api_router.include_router(eligibility.router)
api_router.include_router(applications.router)
api_router.include_router(benefits.router)
api_router.include_router(notifications.router)
api_router.include_router(mock_gov.router)
