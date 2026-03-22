CONTAINER_NAME=alex-api
IMAGE_NAME=alex:latest

docker image rm $IMAGE_NAME --force
docker container rm $CONTAINER_NAME --force

docker build --no-cache . -t $IMAGE_NAME
docker run --name $CONTAINER_NAME -d -p 1234:8000 $IMAGE_NAME

docker exec -it $CONTAINER_NAME python -m db.seeds
