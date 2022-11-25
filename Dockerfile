FROM node:19-alpine3.15

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start" ]