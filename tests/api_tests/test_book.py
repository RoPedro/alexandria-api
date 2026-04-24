from fastapi import status
from main import apiVer1

genre_json={"name": "Fantasy"}
author_json={"firstname": "J.R.R.", "lastname": "Tolkien"}
json_data = {
    "isbn": "978-0618640157",
    "title": "The Lord of the Rings",
    "description": "An epic fantasy trilogy.",
    "release_date": "1954-07-29",
    "genre_id": None,  # To be set after genre creation
}
def test_correct_insert(client):
    add_genre = client.post(f"{apiVer1}/genres/add", json={"name": "Fantasy"})

    add_author = client.post(
        f"{apiVer1}/authors/add", json={"firstname": "J.R.R.", "lastname": "Tolkien"}
    )

    response = client.post(
        f"{apiVer1}/books/add",
        json={
            "isbn": "978-0618640157",
            "title": "The Lord of the Rings",
            "description": "An epic fantasy trilogy.",
            "release_date": "1954-07-29",
            "genre_id": add_genre.json()["id"],
            "authors": [add_author.json()["id"]],
        },
    )
    assert response.status_code == status.HTTP_200_OK


def test_duplicate_isbn_insert(client):
    add_genre = client.post(f"{apiVer1}/genres/add", json={"name": "Fantasy"})
    add_author = client.post(
        f"{apiVer1}/authors/add", json={"firstname": "J.R.R.", "lastname": "Tolkien"}
    )

    json_data = {
        "isbn": "978-0618640157",
        "title": "The Lord of the Rings",
        "description": "An epic fantasy trilogy.",
        "release_date": "1954-07-29",
        "genre_id": add_genre.json()["id"],
        "authors": [add_author.json()["id"]],
    }

    client.post(
        f"{apiVer1}/books/add",
        json=json_data,
    )
    duplicate = client.post(
        f"{apiVer1}/books/add",
        json=json_data,
    )

    assert duplicate.status_code == status.HTTP_409_CONFLICT
