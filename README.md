<h1 align="center">
<img alt="Meetapp" src="./imgs/meetapp.svg" style="font-size: 64px;" />
<br>
Bootcamp GoStack Meetapp
</h1>

<h4 align="center">
  Share your ideas. Create a meetup! :octocat: :rocket:
</h4>

# Backend

## :computer: Run it!

```bash

# Install the dependencies
yarn install

# Set up the docker container for the postgres service
docker run --name postgres -e POSTGRES_PASSWORD=<database_password> -p 5432:5432 -d postgres

# Set up the docker container for the mongodb service
sudo docker run --name mongo -p 27017:27017 -d -t mongo

# Set up the docker container for the redis service
sudo docker run --name redis -p 6379:6379 -d -t redis:alpine

# Copy the .env.example that is in the root of the project, rename it to .env and fill the variables according to your enviroment

# Run migrations to your database
yarn sequelize db:migrate

# Run the backend server
yarn dev
yarn queue

```

## Check the rest of the project! :pray:

### <a href="https://github.com/Felibread/meetapp-frontend">Frontend</a>

### <a href="https://github.com/Felibread/meetapp-mobile">Mobile</a>

---

Made with much :purple_heart: and :muscle: by Felipe Jung :blush: <a href="https://www.linkedin.com/in/felipe-jung/">Talk to me!</a>
