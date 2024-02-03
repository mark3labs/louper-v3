REGISTRY         := mark3labs
FRONTEND_NAME    := louper-web
TAG              := $$(git log -1 --pretty=%h)
FRONTEND_IMG     := ${REGISTRY}/${FRONTEND_NAME}:${TAG}
FRONTEND_LATEST  := ${REGISTRY}/${FRONTEND_NAME}:latest
FRONTEND_DOCKERFILE := ./Dockerfile

.PHONY: build-frontend push-frontend clean

build-frontend:
	@echo "Building front-end"
	@docker build -t ${FRONTEND_IMG} -f ${FRONTEND_DOCKERFILE} .
	@docker tag ${FRONTEND_IMG} ${FRONTEND_LATEST}

push-frontend:
	@echo "Deploying front-end"
	@docker push ${FRONTEND_LATEST}
	@docker push ${FRONTEND_IMG}

clean:
	@echo "Cleaning up images"
	@docker rmi ${BACKEND_IMG} ${BACKEND_LATEST} ${FRONTEND_IMG} ${FRONTEND_LATEST}
