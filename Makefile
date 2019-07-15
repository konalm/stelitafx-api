deploy:
	git pull \
	&& forever stopall \
	&& forever restartall;

deploy-docker:
	git pull \
	&& docker build -f Dockerfile.prod -t stelitafx-api-prod . \
	&& docker run --rm -p 8000:8000 stelitafx-api-prod;
