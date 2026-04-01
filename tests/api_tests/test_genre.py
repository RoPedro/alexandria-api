from fastapi import status
from main import apiVer1


def test_correct_insert(client):
    response = client.post(f"{apiVer1}/genres/add", json={"name": "test_genre"})
    assert response.status_code == status.HTTP_200_OK


def test_reject_duplicate_name(client):
    client.post(f"{apiVer1}/genres/add", json={"name": "test_genre"})
    duplicate = client.post(f"{apiVer1}/genres/add", json={"name": "test_genre"})
    assert duplicate.status_code == status.HTTP_409_CONFLICT
