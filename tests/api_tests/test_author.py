from fastapi import status
from main import apiVer1


def test_correct_insert(client):
    response = client.post(
        f"{apiVer1}/authors/add", json={"firstname": "Anakin", "lastname": "Skywalker"}
    )
    assert response.status_code == status.HTTP_200_OK


def test_reject_fullname_duplicate(client):
    client.post(
        f"{apiVer1}/authors/add", json={"firstname": "Anakin", "lastname": "Skywalker"}
    )
    duplicate = client.post(
        f"{apiVer1}/authors/add", json={"firstname": "Anakin", "lastname": "Skywalker"}
    )

    assert duplicate.status_code == status.HTTP_409_CONFLICT
