FROM node:20.12.2 as development

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD [ "npm", "run", "start:dev" ]


FROM node:20.12.2 as production

WORKDIR /app

COPY package.json .

RUN npm install --only=production

COPY . .

CMD [ "npm", "run", "start:prod" ]
