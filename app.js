const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const User = require('./models/user');
const path = require('path');
const session = require('express-session');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true
	})
);

mongoose
	.connect('mongodb://localhost:27017/auth-new', { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('MONGO CONNECTION OPEN!!!');
	})
	.catch((err) => {
		console.log('OH NO MONGO CONNECTION ERROR!!!!');
		console.log(err);
	});

const validateUser = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/login');
	}
	next();
};

app.get('/', (req, res) => {
	res.send('HOME PAGE');
});

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', async (req, res) => {
	const { username, password } = req.body;
	const user = new User({ username, password });
	await user.save();
	req.session.user = user._id;
	res.redirect('/secret');
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const foundUser = await User.findAndValidate(username, password);
	if (foundUser) {
		req.session.user = foundUser._id;
		res.redirect('/secret');
	} else {
		res.redirect('/login');
	}
});

app.post('/logout', (req, res) => {
	req.session.user = null;
	res.redirect('/login');
});

app.get('/secret', validateUser, (req, res) => {
	res.render('secret');
});

app.listen(3000, () => {
	console.log('LISTENING ON PORT 3000');
});
