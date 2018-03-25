const express = require('express')
const app = express()

app.init = () => {
	const expressFileupload = require('express-fileupload')
	const hbs = require('hbs')
	const appController = require('./controllers/appController')

	app.use(expressFileupload())

	app.set('view engine', 'hbs')
	app.engine('hbs', hbs.__express)
	app.set('views', __dirname + "/views")

	hbs.registerPartials(__dirname + "/views/partials")

	app.use((req, res, next) => {
		res.view = (template, context = {}) => {
			appController.state()
			.then(state => {
				let validUrls = appController.getValidUrls(state.stage)
				if (validUrls.indexOf(req.url) == -1) return res.sendStatus(404)
				let sidebar = appController.generateSidebar(state.stage, req.url)
				res.render(template, {...context, sidebar})
			})
		}
		next()
	})
	require('./routes')(app)
}

module.exports = app