const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')

const { Student } = require("../../database")

exports.list = (req, res) => {
	Student.find({})
	.then(students => res.send({success: true, students}))
}
exports.create = (req, res) => {}
exports.update = (req, res) => {}
exports.delete = (req, res) => {}

exports.generatePinFile = () => {
	return Student.find(null, null, {
		sort: {
			grade: 1,
			section: 1,
			name: 1
		}
	})
	.select('-_id name grade section house pin')
	.then(_students => {
		let students = _students.map(s => s.toJSON())
		students.unshift({
			name: 'Name',
			grade: 'Grade',
			section: 'Section',
			house: 'House',
			pin: 'Pin'
		})
		const csvString = Papa.unparse(students, {header: false})
		fs.writeFileSync(path.resolve(__dirname, '../static/downloads/pins/student.csv'), csvString)
	})
}

exports.bulkCreate = (req, res, next) => {
	const { students } = req.post
	Student.remove({}) // remove all existing ones
	.then(() => Student.collection.insert(
		students
		.sort(() => .5 - Math.random())
		.map((s, i) => {
			// generate a random pin
			const pin = i + 1000 + ""
			return {
				name: s[0],
				grade: parseInt(s[1]),
				section: s[2],
				house: s[3],
				used: false,
				voted: false,
				pin
			}
		})
	))
	.then(() => next())
	.catch(e => {
		res.status(500).send({success: false, message: 'unexpected'})
		throw e
	})
}