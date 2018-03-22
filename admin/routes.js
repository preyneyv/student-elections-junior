const express = require('express')

const candidateController = require('./candidateController')
const positionController = require('./positionController')
const studentController = require('./studentController')

module.exports = (app) => {
	app.use(express.static(__dirname + "/static"))

	app.get('/', (req, res) => res.redirect('./candidates'))
	app.get('/candidates', (req, res) => res.file('views/candidates.html'))
	app.get('/positions', (req, res) => res.file('views/positions.html'))
	app.get('/students', (req, res) => res.file('views/students.html'))
	app.get('/results', (req, res) => res.file('views/results.html'))

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

	app.route('/api/students/:id?')
	.get(studentController.list)
	.put(studentController.create)
	.patch(studentController.update)
	.delete(studentController.delete)

	app.route('/api/results')
	.get(positionController.results)

	app.use('/images', express.static(studentElectionsJunior.imagesDir))
}