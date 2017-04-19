const express = require('express');
const Sequelize = require('sequelize');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const errors = require('./utils/errors');
const config = require('./config');

const dbcontext = require('./context/db')(Sequelize, config);

const domainService = require('./services/domain')(dbcontext.domain, dbcontext.user, errors);
const authService = require('./services/auth')(dbcontext.user, dbcontext.role, errors);
const cacheService = require('./services/cache');

const apiController = require('./controllers/api')(domainService, authService, cacheService, config);

const logger = require('./utils/logger');
const auth = require('./utils/auth')(authService, config, errors);
const cache = require('./utils/cache')(cacheService);

const app = express();

app.use(express.static('public'));
app.use(cookieParser(config.cookie.key));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', logger);
app.use('/api', auth);
app.use('/api', cache);
app.use('/api', apiController);

const port = process.env.PORT || 3000;

dbcontext.sequelize
    .sync()
    .then(() =>
    {
        app.listen(port, () => console.log('Running on http://localhost:3000'));
    })
    .catch((err) => console.log(err));