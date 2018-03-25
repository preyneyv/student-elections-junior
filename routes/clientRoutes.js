const express = require('express')
const path = require('path')

const studentController = require("../controllers/studentController")
const teachersController = require("../controllers/teachersController")
const managementController = require("../controllers/managementController")
const clientController = require('../controllers/clientController')

module.exports = app => {
	app.use(express.static(path.resolve(__dirname, "../client/static")))

	app.get('/', clientController.index)

	app.use('/images', express.static(studentElectionsJunior.imagesDir))

	app.post('/api/check', studentController.check)
	app.get('/api/fetch', studentController.fetch)
	app.post('/api/submit', studentController.submit)

	app.post('/teachers/api/check', teachersController.check)
	app.get('/teachers/api/fetch', teachersController.fetch)
	app.post('/teachers/api/submit', teachersController.submit)

	app.post('/management/api/check', managementController.check)
	app.get('/management/api/fetch', managementController.fetch)
	app.post('/management/api/submit', managementController.submit)
}