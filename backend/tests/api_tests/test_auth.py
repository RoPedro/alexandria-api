from fastapi import status

from main import apiVer1

REGISTER = f"{apiVer1}/auth/register"
LOGIN = f"{apiVer1}/auth/login"
ME = f"{apiVer1}/auth/me"
USERS = f"{apiVer1}/auth/users"


def test_register_creates_a_regular_user(client):
    response = client.post(
        REGISTER, data={"username": "guest", "password": "password123"}
    )

    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["user"]["username"] == "guest"
    assert body["user"]["role"] == "user"
    assert body["access_token"]


def test_register_rejects_a_duplicate_username(client):
    client.post(REGISTER, data={"username": "guest", "password": "password123"})
    duplicate = client.post(
        REGISTER, data={"username": "guest", "password": "password123"}
    )

    assert duplicate.status_code == status.HTTP_409_CONFLICT


def test_register_rejects_a_short_password(client):
    response = client.post(REGISTER, data={"username": "guest", "password": "short"})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_register_cannot_grant_the_admin_role(client):
    response = client.post(
        REGISTER,
        data={"username": "sneaky", "password": "password123", "role": "admin"},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["user"]["role"] == "user"


def test_login_returns_a_token(client):
    client.post(REGISTER, data={"username": "guest", "password": "password123"})

    response = client.post(LOGIN, data={"username": "guest", "password": "password123"})

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["token_type"] == "bearer"


def test_login_rejects_a_wrong_password(client):
    client.post(REGISTER, data={"username": "guest", "password": "password123"})

    response = client.post(
        LOGIN, data={"username": "guest", "password": "wrong-password"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_returns_the_session_user(client):
    client.post(REGISTER, data={"username": "guest", "password": "password123"})
    token = client.post(
        LOGIN, data={"username": "guest", "password": "password123"}
    ).json()["access_token"]

    response = client.get(ME, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["username"] == "guest"


def test_me_requires_a_token(client):
    response = client.get(ME)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_read_routes_stay_public(client):
    response = client.get(f"{apiVer1}/genres/")

    assert response.status_code == status.HTTP_200_OK


def test_write_routes_require_a_token(client):
    response = client.post(f"{apiVer1}/genres/add", data={"name": "fantasy"})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_write_routes_reject_a_regular_user(client, user_headers):
    response = client.post(
        f"{apiVer1}/genres/add", data={"name": "fantasy"}, headers=user_headers
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_write_routes_accept_an_admin(client, admin_headers):
    response = client.post(
        f"{apiVer1}/genres/add", data={"name": "fantasy"}, headers=admin_headers
    )

    assert response.status_code == status.HTTP_200_OK


def test_delete_routes_reject_a_regular_user(client, user_headers):
    response = client.delete(f"{apiVer1}/genres/delete/1", headers=user_headers)

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_can_register_another_admin(client, admin_headers):
    response = client.post(
        USERS,
        data={"username": "second-admin", "password": "password123", "role": "admin"},
        headers=admin_headers,
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["role"] == "admin"


def test_a_regular_user_cannot_register_other_users(client, user_headers):
    response = client.post(
        USERS,
        data={"username": "another", "password": "password123"},
        headers=user_headers,
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_can_list_the_users(client, admin_headers):
    response = client.get(USERS, headers=admin_headers)

    assert response.status_code == status.HTTP_200_OK
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)
