from fastapi import HTTPException


def validate_request_details(entity_id, entity_data):
    if not entity_data:
        raise HTTPException(status_code=404, detail="Entity not found in the database")
    if isinstance(entity_id, str):
        raise HTTPException(
            status_code=400,
            detail="Requested ID is a string when it should be an integer",
        )
