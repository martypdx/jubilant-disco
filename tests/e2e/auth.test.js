const db = require('./helpers/db');
const request = require('./helpers/request');
const {assert} = require('chai');

describe('auth', () => {
    before(db.drop);

    const user = {
        name: 'user',
        email: 'me@me.com',
        password: 'abc'
    };

    describe('user management', () => {

        const badRequest = (url, data, code, error) => {
            request
                .post(url)
                .send(data)
                .then(
                    () => {
                        throw new Error('status should not be okay');
                    },
                    res => {
                        assert.equal(res.status, code);
                        assert.equal(res.response.body.error, error);
                    }
                );
        };

        it('signup requires email', () =>
            badRequest('/signup', {password : 'abc'}, 400, 'email and password must be supplied')
        );

        it('signup requires password', () =>
            badRequest('/signup', {email : 'abc'}, 400, 'email and password must be supplied')
        );

        let token = '';

        it.only('signup', () =>
            request
                .post('/users/signup')
                .send(user)
                .then(res => assert.ok(token = res.body.token))
        );

        it('cant use the same email', () =>
            badRequest('/signup', user, 400, 'email in use')
        );

        it('signin requires email', () =>
            badRequest('/signin', {password:'abc'}, 400, 'email and password must be supplied')
        );

        it('signin requires password', () =>
            badRequest('/auth/signin', {email:'abc'}, 400, 'email and password must be suppied')
        );

        it('signin with wrong user', () =>
            badRequest('/auth/signin', {email:'bad user', password:user.password}, 400, 'Invalid Login')
        );

        it('signin with wrong password', () =>
            badRequest('/auth/signin', {email: user.email, password:'bad password'}, 400, 'Invalid Login')
        );

        it('signin', () =>
            request
                .post('/auth/signin')
                .send(user)
                .then(res => assert.ok(res.body.token))
        );

        it('token is invalid', () =>
            request
                .get('/auth/verify')
                .set('Authorization', 'bad token')
                .then(
                    () => {throw new Error('success response not expected');},
                    (res) => {assert.equal(res.status, 401);}
                )
        );

        it('token is valid', () =>
            request
                .get('/auth/verify')
                .set('Authorization', token)
                .then(res => assert.ok(res.body))
        );
    });

});