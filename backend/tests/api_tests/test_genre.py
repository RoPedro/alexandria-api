from fastapi import status

from main import apiVer1


def test_correct_insert(client, admin_headers):
    response = client.post(
        f"{apiVer1}/genres/add", data={"name": "test_genre"}, headers=admin_headers
    )
    assert response.status_code == status.HTTP_200_OK


def test_reject_duplicate_name(client, admin_headers):
    client.post(
        f"{apiVer1}/genres/add", data={"name": "test_genre"}, headers=admin_headers
    )
    duplicate = client.post(
        f"{apiVer1}/genres/add", data={"name": "test_genre"}, headers=admin_headers
    )
    assert duplicate.status_code == status.HTTP_409_CONFLICT
