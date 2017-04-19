const express = require('express');

module.exports = (domainService, authService, cacheService, config) =>
{
    const router = express.Router();
    const domainController = require('./domain')(domainService, cacheService, config, promiseHandler);
    const authController = require('./auth')(authService, config);

    router.use('/domains', domainController);
    router.use('/auth', authController);

    return router;
};

function promiseHandler(res, promise)
{
    promise.then((data) => res.json(data)).catch((err) => res.error(err));
}