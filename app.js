const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

require('dotenv').config();

const db = require('./server/util/db');
db.test();

const app = express();
const port = process.env.PORT || 5001;

// Parsing middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// Static Files
app.use(express.static('public'));

// Templating Engine
app.engine('hbs', exphbs( {extname: '.hbs', helpers: require('./config/helpers') }));
app.set('view engine', 'hbs');

app.use('/', require('./server/routes/stock'));
app.use('/', require('./server/routes/pages'));

app.listen(port, () => console.log(`Listening on port ${port}`));