// ⊗ndMgDPAF - 1, 2

import mongodb from 'mongodb';
import express from 'express';

import flash from "connect-flash";
import bodyParser from 'body-parser';

import cookieParser from 'cookie-parser';
import expressSession from 'express-session';

import expressHandlebars from 'express-handlebars';
const handlebars = expressHandlebars.create({
	defaultLayout: 'main',
	extname: 'hbs'
});

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));

let secret = 'qwerty';
app.use(cookieParser(secret));
app.use(expressSession({
	secret: secret,
}));

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.use(flash());

try {

	let mongoClient = new mongodb.MongoClient('mongodb://127.0.0.1:27017/', {
		useUnifiedTopology: true
	});

	await mongoClient.connect();

	const db = mongoClient.db('test');
	let coll = db.collection('prods');

	app.get('/prods', async function (req, res) {

		let wrapper = req.flash('prod');

		let massage = '';
		if (wrapper[0] !== undefined) {
			massage = wrapper[0];
		}

		wrapper = [];

		let prods = await coll.find().toArray();
		res.render('prods', { prods: prods, massage: massage })
	})

	app.get('/prods/show/:name', async function (req, res) {

		let name = req.params.name;

		let prod = await coll.findOne({ name: name });

		if (prod) {
			res.render('prod', { prod: prod });
		} else {
			res.render('404');
		}
	})

	app.get('/prods/delete/:name', async function (req, res) {

		let name = req.params.name;

		await coll.deleteOne({ name: name });

		req.flash('prod', 'вы удалили продукт: ' + name)
		res.redirect(301, `/prods`);
	})

	app.get('/prod/add', function (req, res) {
		res.render('add');
	})

	app.post('/prod/add', function (req, res) {

		let prod = {
			name: req.body.name,
			cost: req.body.cost,
			rest: req.body.rest,
		}

		coll.insertOne(prod);
		req.flash('prod', 'вы добавили продукт: ' + prod.name);
		res.redirect(301, `/prods`);

	})

} catch (err) {
	console.error(err);
}

app.listen(3000, function () {
	console.log('running');
});