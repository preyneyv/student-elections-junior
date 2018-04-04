const express = require('express')
const path = require('path')

const studentController = require("../controllers/studentController")
const teachersController = require("../controllers/teachersController")
const managementController = require("../controllers/managementController")
const clientController = require('../controllers/clientController')

module.exports = app => {
	app.use(express.static(path.resolve(__dirname, "../client/static")))

	app.get('/', clientController.index)
	app.get('/teachers/', 
		clientController.checkVoting,
		(req, res) => res.render('teachersVoting')
	)
	app.get('/management/', 
		clientController.checkVoting,
		(req, res) => res.render('managementVoting')
	)

	app.use('/images', express.static(studentElectionsJunior.imagesDir))

	app.post(
		'/api/check',
		clientController.checkVoting,
		studentController.check
	)
	app.get(
		'/api/fetch',
		clientController.checkVoting,
		studentController.fetch
	)
	app.post(
		'/api/submit',
		clientController.checkVoting,
		studentController.submit
	)

	app.post(
		'/teachers/api/check',
		clientController.checkVoting,
		teachersController.check
	)
	app.get(
		'/teachers/api/fetch',
		clientController.checkVoting,
		teachersController.fetch
	)
	app.post(
		'/teachers/api/submit',
		clientController.checkVoting,
		teachersController.submit
	)

	app.post(
		'/management/api/check',
		clientController.checkVoting,
		managementController.check
	)
	app.get(
		'/management/api/fetch',
		clientController.checkVoting,
		managementController.fetch
	)
	app.post(
		'/management/api/submit',
		clientController.checkVoting,
		managementController.submit
	)

}