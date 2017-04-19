module.exports = (cacheService) => {
    return (req, res, next) => {
        var data = cacheService.get(req);

        if (data) res.json(data);
        else next();
    }
};