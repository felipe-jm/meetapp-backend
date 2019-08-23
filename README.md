# Meetapp - backend

## This is RocketSeat:rocket:<a href="https://github.com/Rocketseat/bootcamp-gostack-desafio-02/blob/master/README.md#desafio-02-iniciando-aplica%C3%A7%C3%A3o"> Challenge 02</a>

### Setting up the development environment

This is a documentation about the enviroment setup to develop a nodejs backend with Sequelize. It was made by myself and to my future self because that's a lot to remember.

Enjoy :)

---

Init yarn:

```bash
yarn init -y
```

Install express

```bash
yarn add express
```

Create the following structure

```bash
src
├── app.js
├── routes.js
└── server.js
```

Structure the files using a class named App and then isolate the app from the routes and the server.

* app.js: contains the configs of the server.

* server.js: used to iniate app. (server.listen).

* routes.js: contain the routes(obviously).

Install sucrase and nodemon as development depencies

```bash
yarn add sucrase nodemon -D
```

At "package.json", include "scripts"

```json
"scripts": {
    "dev": "nodemon src/server.js"
  },
```

And create a file named "nodemon.js" with the following json

```json
{
    "execMap": {
        "js": "sucrase-node"
    }
}
```

---

### Setting up a docker container for the Postgres Service

With docker installed, run:

```bash
docker run --name <container_name> -e POSTGRES_PASSWORD=<database_password> -p 5432:5432 -d postgres
```

Check if the container is up and running

```bash
docker ps
```

_<a href="https://electronjs.org/apps/postbird">Postbird</a> is a good option for visualizing your Postgres database_

Inside Postbird, create a database with whatever the name you want and that's it!

Now you have a Postgres database.

---

### up Eslint, prettier & Editor config


_To be continued..._

