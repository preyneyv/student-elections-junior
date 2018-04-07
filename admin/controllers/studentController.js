const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')

const { Student } = require("../../database")

exports.list = (req, res) => {
	Student.find({})
	.then(students => res.send({success: true, students}))
}

exports.create = (req, res) => {
	let { name, grade, section, house } = req.post
	let existingPins = []
	Student.find()
	.select('pin')
	.then(students => {
		existingPins = students.map(s => s.pin)
		if (existingPins.length == 10000) {
			return res.send({success: false, message: "cant_support_more_students"})
		}
		let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		while (existingPins.indexOf(pin) != -1) {
			// get a new pin.
			pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		}
		return (new Student({
			name, grade, section, house, pin
		})).save()
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false})
		throw e
	})
}

exports.update = (req, res) => {
	let { id } = req.params
	let { name, grade, section, house } = req.post

	Student.findByIdAndUpdate(id, {
		name, grade, section, house
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.delete = (req, res) => {
	let { id } = req.params
	Student.remove({_id: id})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.resetPin = (req, res) => {
	let { id } = req.params
	Student.findByIdAndUpdate(id, {
		used: false,
		voted: false
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}

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
	let usedPins = []
	Student.remove({}) // remove all existing ones
	.then(() => Student.collection.insert(
		students
		.sort(() => .5 - Math.random())
		.map((s, i) => {
			// generate a random pin
			let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
			while (usedPins.indexOf(pin) != -1) {
				// get a new pin.
				pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
			}
			usedPins.push(pin)
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