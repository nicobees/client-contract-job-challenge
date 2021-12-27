const express = require('express');
const bodyParser = require('body-parser');

const { initContainer } = require('./components/container');

const app = express();
app.use(bodyParser.json());

const { routers, middlewares } = initContainer(app)

for(const router of routers) {
    app.use('/', router)
}

module.exports = app;
