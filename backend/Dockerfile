FROM node:20-alpine

WORKDIR /app 

COPY package*.json /app/

RUN npm install 

COPY . .

ENV PORT=8000

EXPOSE 8000 

ENTRYPOINT [ "node" ]

CMD ["server.js"]