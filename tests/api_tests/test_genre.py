from fastapi import status
from main import apiVer1


def test_correct_insert(client):
    response = client.post(f"{apiVer1}/genres/add", json={"name": "test_genre"})
    assert response.status_code == status.HTTP_200_OK
