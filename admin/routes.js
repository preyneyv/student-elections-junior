const express = require('express')

const candidateController = require('./controllers/candidateController')
const positionController = require('./controllers/positionController')
const studentController = require('./controllers/studentController')
const teacherController = require('./controllers/teacherController')
const managementController = require('./controllers/managementController')

module.exports = (app) => {
	app.use('/downloads/pins/*', (req, res, next) => {
		// generate all the pin csvs
		Promise.all([
			studentController.generatePinFile(),
			teacherController.generatePinFile(),
			managementController.generatePinFile(),
		])
		.then(() => next())
	}) 
	app.use(express.static(__dirname + "/static"))

	app.get('/', (req, res) => res.redirect('./candidates'))
	app.get('/candidates', (req, res) => res.file('views/candidates.html'))
	app.get('/positions', (req, res) => res.file('views/positions.html'))
	app.get('/students', (req, res) => res.file('views/students.html'))
	app.get('/teachers', (req, res) => res.file('views/teachers.html'))
	app.get('/management', (req, res) => res.file('views/management.html'))
	app.get('/results', (req, res) => res.file('views/results.html'))
	app.get('/import', (req, res) => res.file('views/import.html'))

	app.route('/api/candidates/')
	.get(candidateController.list)
	.put(candidateController.create)
	app.route('/api/candidates/:id')
	.patch(candidateController.update)
	.delete(candidateController.delete)

	app.route('/api/positions/')
	.get(positionController.list)
	.put(positionController.create)
	app.route('/api/positions/:id')
	.patch(positionController.update)
	.delete(positionController.delete)

	app.route('/api/positions/:positionId/:candidateId')
	.delete(positionController.deleteAssociation)
	.put(positionController.createAssociation)

	app.route('/api/students/')
	.get(studentController.list)
	.put(studentController.create)
	app.route('/api/students/:id')
	.patch(studentController.update)
	.delete(studentController.delete)
	app.route('/api/students/:id/reset')
	.post(studentController.resetPin)

	app.route('/api/teachers/')
	.get(teacherController.list)
	.put(teacherController.create)
	app.route('/api/teachers/:id')
	.patch(teacherController.update)
	.delete(teacherController.delete)
	app.route('/api/teachers/:id/reset')
	.post(teacherController.resetPin)

	app.route('/api/management/')
	.get(managementController.list)
	.put(managementController.create)
	app.route('/api/management/:id')
	.patch(managementController.update)
	.delete(managementController.delete)
	app.route('/api/management/:id/reset')
	.post(managementController.resetPin)

	app.route('/api/results')
	.get(positionController.results)

	app.post('/api/bulkCreate', 
		positionController.bulkCreate,
		studentController.bulkCreate,
		teacherController.bulkCreate,
		managementController.bulkCreate,
		candidateController.addAbstain,
		(req, res) => res.send({success: true})
	)

	app.use('/images', express.static(studentElectionsJunior.imagesDir))
}