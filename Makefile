.PHONY: load-db image run 

load-db: 
	docker-compose --profile db_load up

dir:
	- docker-compose down 
	- docker-compose build 
	- docker-compose up -d 

