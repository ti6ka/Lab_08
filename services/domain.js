const jwt = require('jsonwebtoken');
const request = require('request');

module.exports = (domainRepository, userRepository, errors) =>
{
	//
    const BaseService = require('./base');
    const needle = require("needle");
    var Promise = require("bluebird");
    Promise.promisifyAll(needle);

    Object.setPrototypeOf(DomainService.prototype, BaseService.prototype);

    function DomainService(domainRepository, errors)
    {
        BaseService.call(this, domainRepository, errors);

        var self = this;
        self.check = check;
        self.pay = pay;

        function check(domain)
        {
            return new Promise((resolve, reject) =>
            {
                request({
                    headers: {
                        'Origin': 'https://www.namecheap.com/',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    uri: 'https://api.domainr.com/v2/status?domain='+ domain + '&client_id=fb7aca826b084569a50cfb3157e924ae',
                    method: 'get'
                }, function (err, res, body)
                {
                    if(JSON.parse(body).status[0].status == "undelegated")
                    {
                        domainRepository.findAll({ where: {name: domain} })
                            .then((domain) =>
                            {
                                if(domain.length != 0)
                                {
                                    resolve({status: "domain already use"})
                                }
                                else
                                {
                                    resolve({status: "domain free"})
                                }
                            })
                            .catch(reject);
                    }
                    else if(JSON.parse(body).status[0].status == "active")
                    {
                        resolve({status: "domain already use"})
                    }

                });

                /*needle.getAsync('https://api.domainr.com/v2/status?domain=' + domain +'&client_id=fb7aca826b084569a50cfb3157e924ae')
                    .then((body)=>
                    {
                        if(body.body.status[0].status == "undelegated")
                        {
                            domainRepository.findAll({ where: {name: domain} })
                                .then((domain) =>
                                {
                                    if(domain.length != 0)
                                    {
                                        resolve({status: "domain already use"})
                                    }
                                    else
                                    {
                                        resolve({status: "domain free"})
                                    }
                                })
                                .catch(reject);
                        }
                        else if(body.body.status[0].status == "active")
                        {
                            resolve({status: "domain already use"})
                        }
                    })*/
            })
        }

        function pay(domainName, tokenUserId)
        {
            return new Promise((resolve, reject) =>
            {
                check(domainName)
                    .then((response) =>
                    {
                        if (tokenUserId)
                        {
                            jwt.verify(tokenUserId, 'shhhhh', function (err, decoded)
                            {
                                if (err != null) reject(errors.Unauthorized);
                                var userId = decoded.__user_id;
                                if (response.status == "domain already use")
                                {
                                    reject({status: "domain already use"});
                                }
                                else
                                {
                                        var domain =
                                        {
                                            name: domainName
                                        };
                                        Promise.all([self.baseCreate(domain), userRepository.findById(userId)])
                                            .spread((domain, user)=>
                                            {
                                                return Promise.all([user.addDomain(domain), user.decrement({cache: 20})]);
                                            })
                                            .spread((domain, user) =>
                                            {
                                                if (user.cache - 20 < 0) reject(errors.PaymentRequired)
                                                resolve({success: true})
                                            })
                                            .catch(reject);
                                }
                            })
                        }
                        else
                        {
                            reject(errors.Unauthorized)
                        }
                    })
                    .catch(reject);
            });
        }
    }

    return new DomainService(domainRepository, errors);
};