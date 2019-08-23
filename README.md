# Meetapp - backend

## This is RocketSeat:rocket:<a href="https://github.com/Rocketseat/bootcamp-gostack-desafio-02/blob/master/README.md#desafio-02-iniciando-aplica%C3%A7%C3%A3o"> Challenge 02</a>

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

### Configuring Sequelize

Install Sequelize

```bash
yarn add sequelize
```

```bash
yarn add sequelize-cli -D
```

Create a .sequelizerc file

Espeficy the paths to your database elements

```javascript
const { resolve } = require('path');

module.exports = {
  config: resolve(__dirname, 'src', 'config', 'database.js'),
  'models-path': resolve(__dirname, 'src', 'app', 'models'),
  'migrations-path': resolve(__dirname, 'src', 'database', 'migrations'),
  'seeders-path': resolve(__dirname, 'src', 'database', 'seeds'),
};
```
Inside database.js

```javascript
module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: '<password>',
  database: '<database_name>',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
```

Then, for postgres, run

```bash
yarn add pg pg-hstore
```
------

Creating a migration for users

```bash
yarn sequelize migration:create --name=create-users
```

Users table:

```javascript
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organizer: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('users');
  },
};

```

To execute a migration

```bash
yarn sequelize db:migrate
```
To undo a migration

```bash
yarn sequelize db:migrate:undo
```

To undo all migrations

```bash
yarn sequelize db:migrate:undo:all
```

------

A Model creation example

```javascript
import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password_hash: Sequelize.STRING,
        organizer: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
  }
}

export default User;
```

A connection example

```javascript
import Sequelize from 'sequelize';

import User from '../app/models/User';

import databaseConfig from '../config/database';

const models = [User];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
```

A controller example

```javascript
import User from '../models/User';

class UserController {
  async store(req, res) {
    const user = await User.create(req.body);

    return res.json(user);
  }
}

export default new UserController();
```

------

### Encrypting password

Install bcrypt

```bash
yarn add bcryptjs
```

Import bcrypt inside the model

```javascript
import bcrypt from 'bcryptjs';
```

Create a Sequelize Hook that encryts the password before saving the user in the database

```javascript
  this.addHook('beforeSave', async user => {
    if (user.password) {
      user.password_hash = await bcrypt.hash(user.password, 8);
    }
  });
```

------

### Using JWT

Install jsonwebtoken

```bash
yarn add jsonwebtoken
```

When the user loggs in, create a session and pass the jwt token

```javascript
 return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
```

_To be continued.._
