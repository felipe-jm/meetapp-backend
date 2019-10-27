# Meetapp - backend

## This is RocketSeat:rocket:<a href="https://github.com/Rocketseat/bootcamp-gostack-desafio-02/blob/master/README.md#desafio-02-iniciando-aplica%C3%A7%C3%A3o"> Challenge 02</a> and <a href="https://github.com/Rocketseat/bootcamp-gostack-desafio-03/blob/master/README.md#desafio-03-continuando-aplica%C3%A7%C3%A3o">Challenge 03</a>

_This is an extense readme cause I made it attempting a better understanding of the concepts used in this project._

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
That's going to create you a token for that session, what you should do is to save it somehow to use it later when the user tries to make some action, like a update.

The next step is to create e middleware that's going to be executed when a user tries do update some infos. It will look something like that:

```javascript
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no provided.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
};
```

### Data validatin with Yup

Install Yup

```bash
yarn add yup
```

import it all using

```javascript
import * as Yup from 'yup';
```

An example of field data validation with Yup

```javascript
const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
```

And with conditionals

```javascript
const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
```

### Using Multer to handle images

Install multer

```bash
yarn add multer
```
Create a config for multer like the following

```javascript
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
```
_This configures multer and gives a random name to the image to certify it's going to be unique._

Then use multer as a middleware to your route that is gonna handle the upload

```javascript
import multer from 'multer';
import multerConfig from './config/multer';

const upload = multer(multerConfig);

routes.post('/files', upload.single('file'), FileController.store);
```

That's gonna store the file sent via multipart form in the the path stablished in the multer config.

### Stablishing connections between tables with Sequelize

A migration that adds a column to a table and stablishes a relation with another table(in this case, this column is the avatar_id and is the foreignkey of avatars)

```javascript
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'avatar_id', {
      type: Sequelize.INTEGER,
      reference: {
        model: 'avatars',
        key: 'id',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
```
_It's necessary to stablish this connection inside the model that receives the foreignkey_

```javascript
static associate(models) {
  this.belongsTo(models.Avatar, { foreignKey: 'avatar_id' });
}
```

Executing method above inside the database.js index, which iniates the models connection.

```javascript
init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
}
```

### Using Nodemailer to send emails

Install Nodemailer

```bash
yarn add nodemailer
```
Create the config file

```javascript
export default {
  host: 'smtp.mailtrap.io',
  port: 2525,
  secure: false,
  auth: {
    user: 'b3af98033ed95b',
    pass: 'c17ac0d90a4a99',
  },
  defaul: {
    from: 'Meetapp Team <noreply>@meetapp.com',
  },
};
```
Create a Mail class that sets up Nodemailer service

```javascript
import nodemailer from 'nodemailer';
import mailConfig from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null,
    });
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
```

Then use sendmail wherever you want

```javascript
await Mail.sendMail({
  to: `${meetup.organizer.name} <${meetup.organizer.email}>`,
  subject: `Novo usuário inscrito no Meetup ${meetup.name}`,
    text: 'Usuário inscrito',
});
```

### Using MongoDB to store notifications

Start a Mongo container

```bash
sudo docker run --name <container_name> -p 27017:27017 -d -t mongo
```

Make the connection

```javascript
import mongoose from 'mongoose';

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/meetapp',
      { useNewUrlParser: true, useFindAndModify: true }
    );
  }
```

Creating a Schema

```javascript
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
```

Then send register the notification

```javascript
/**
* Notify organizer that somone has subscribed to meeetup
*/
await Notification.create({
  content: `${user.name} has subscribed to your meetup ${meetup.name}!`,
    user: meetup.organizer_id,
});
```

_To be continued.._
