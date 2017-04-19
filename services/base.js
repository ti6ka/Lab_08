module.exports = BaseService;

function BaseService(repository, errors)
{
    const defaults =
    {
        readChunk:
        {
            limit: 10,
            page: 1,
            order: 'asc',
            orderField: 'id'
        }
    };
    var self = this;

    this.readChunk = readChunk;
    this.read = read;
    this.baseCreate = baseCreate;

    function readChunk(options)
    {
        return new Promise((resolve, reject) =>
        {
            options = Object.assign({}, defaults.readChunk, options);
            var limit = options.limit;
            var offset = (options.page - 1) * options.limit;
            repository
                .findAll({
                    limit: limit,
                    offset: offset,
                    order: [[options.orderField, options.order.toUpperCase()]],
                    raw: true
                })
                .then(resolve).catch(reject);
        });
    }

    function read(id)
    {
        return new Promise((resolve, reject) =>
        {
            id = parseInt(id);

            if (isNaN(id))
            {
                reject(errors.invalidId);
                return;
            }

            repository.findById(id, { raw: true })
                .then((post) =>
                {
                    if (post == null) reject(errors.notFound);
                    else resolve(post);
                })
                .catch(reject);
        });
    }

    function baseCreate(data)
    {
        return new Promise((resolve, reject) =>
        {
            repository.create(data)
                .then(resolve).catch(reject);
        });
    }
}