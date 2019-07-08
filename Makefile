deploy:
	git pull \
	&& docker build -f Dockerfile.prod -t stelitafx-app-prod . \
		&& docker run --rm -p 8080:8080 stelitafx-app-prod;
