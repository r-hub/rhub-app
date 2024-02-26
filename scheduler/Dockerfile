FROM node:20-alpine

RUN apk add --no-cache git

WORKDIR /src
COPY package*.json /
ENV PORT=3001
EXPOSE 3001

RUN npm install -g nodemon && npm install
COPY . .
RUN npm ci

RUN echo "dbpassword" > /db-password

CMD ["npm", "start"]
