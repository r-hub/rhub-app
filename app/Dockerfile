FROM node:20-alpine

WORKDIR /src
COPY package*.json /
EXPOSE 3000

RUN npm install -g nodemon && npm install
COPY . .
RUN npm ci

RUN echo "dbpassword" > /db-password

CMD ["npm", "start"]
