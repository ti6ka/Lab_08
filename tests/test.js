'use strict';
const domain = require('../controllers/domain');
const request = require('supertest')(domain);

const Sequelize = require('sequelize');
const assert = require("assert");
const sinon = require('sinon');
var should = require('should');
const config = require('../config');
const dbcontext = require('../context/db')(Sequelize, config);
const errors = require('../utils/errors');
const Promise = require("bluebird");

let userRepository = dbcontext.user;
let domainRepository = dbcontext.domain;

var userService = require('../services/auth')(userRepository, errors);
var domainService = require('../services/domain')(domainRepository, errors);

var register1 =
{
    email: 'sanya250497@gmail.com',
    password: '12345',
    fullname: 'Alexandr Shatilo'
};

var user1 =
{
    id: '1',
    email: 'sanya250497@gmail.com',
    password: '12345'
};

var user2 =
{
    id: '1',
    email: 'sanya250497@gmail.com',
    password: '12345'
};

var sandbox;
beforeEach(function ()
{
    sandbox = sinon.sandbox.create();
});

afterEach(function ()
{
    sandbox.restore();
});

describe('Сервис auth', ()=>
{
    describe('Функция register', () =>
    {
        it.only('Отдавать объект', () =>
        {
            sandbox.stub(userRepository, 'create').returns(Promise.resolve(null));
            let promise = userService.register(register1);
            return promise.then((result)=>
            {
                result.should.be.an.Object();
            })
        });
    });
    describe('Функция login', () =>
    {
        it('Выбрасывать ошибку, если пароль неправильный', () =>
        {
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve());
            let promise = userService.login(user1);
            return promise.catch((err)=>
            {
                err.status.should.be.equal(errors.wrongCredentials.status);
            })
        });
        it('Отдавать объект, если пароль правильный', () =>
        {
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(user1));
            let promise = userService.login(user2);
            return promise.then((result)=>
            {
                result.should.be.an.String();
            })
        });
    });
})

describe('Сервис domain', ()=>
{
    describe('Функция check', () =>
    {
        it('Выдавать ответ: domain free', () =>
        {
            sandbox.stub(domainRepository, 'findAll').returns(Promise.resolve([]));
            let promise = domainService.check('tut11.by');
            return promise.then((result)=>
            {
                result.status.should.be.equal('domain free');
            })
        });
        it('Выдавать ответ: domain already use', () =>
        {
            sandbox.stub(domainRepository, 'findAll').returns(Promise.resolve([]));
            let promise = domainService.check('tut.by');
            return promise.then((result)=>
            {
                result.status.should.be.equal('domain already use');
            })
        });
    });
})


