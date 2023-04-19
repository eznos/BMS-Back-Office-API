require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { Authentication } = require('./server/middlewares/auth.middleware');
const { RouteV1 } = require('./server/routes/api-version1.route');
// * dayjs use timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Bangkok');

// * config server
const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }));

// * routes
app.use('/v1', Authentication, RouteV1);
app.use((req, res) => {
	res.send(`Detection Server is work now is ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
});

// * start server
const host = process.env.SERVER_HOST || '0.0.0.0';
const port = process.env.SERVER_PORT || 3000;

app.listen(port, host, () => {
	console.log(`API listening on ${host}:${port}`);
});
