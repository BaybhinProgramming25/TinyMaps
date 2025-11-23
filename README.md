# Tiny Maps 

Tiny Maps is a small replica of existing maps applications with an emphasis on application load intensity. 

This project was able to handle a load of __76000 concurrent requests per second (rps), with 99.95% of the requests responding under 30 ms.__

# Technology Requirements

- Docker & Docker-Compose
- Kubernetes via minikube
- K6 Load Testing
- Make 

# Disclaimers:

- You will need to have the following technologies installed above with respect to your own operating system (note: __some of the technologies used here are already provided via docker-compose file__)
- Due to GitHub's size limit of 100 MBs, map data is __NOT__ provided 
    - Create a folder called __map-data__ 
    - Follow the link below to download the .osm.pbf file of your choosing 
    - Place file in the folder 

```
https://download.geofabrik.de/
```

# Running Program with Docker 

```
docker-compose --profile db_load up
docker-compose up -d 
```

You can then visit 

```
http://localhost:5173/
```

# Running Program with Make 

```
make load-db
make dir 
```

You can then also visit 

```
http://localhost:5173/
```

# Architecture

![System Architecture Diagram](images/architecture.png)

