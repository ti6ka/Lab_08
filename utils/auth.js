module.exports = (authService, config, errors) => {
    return (req, res, next) => {
        var userId = req.signedCookies[config.cookie.auth];
        var path = req.url;

        next();
/*        authService.checkPermissions(userId, path)
            .then(() => next())
            .catch(() => res.error(errors.accessDenied));*/
    };
};