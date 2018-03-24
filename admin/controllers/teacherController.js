const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')

const { Teacher } = require("../../database")

exports.list = (req, res) => {
	Teacher.find({})
	.then(teachers => res.send({success: true, teachers}))
}

exports.create = (req, res) => {
	let { name, house } = req.post
	let existingPins = []
	Teacher.find()
	.select('pin')
	.then(teachers => {
		existingPins = teachers.map(s => s.pin)
		if (existingPins.length == 10000) {
			return res.send({success: false, message: "cant_support_more_teachers"})
		}
		let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		while (existingPins.indexOf(pin) != -1) {
			// get a new pin.
			pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		}
		return (new Teacher({
			name, house, pin
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
	let { name, house } = req.post

	Teacher.findByIdAndUpdate(id, {
		name, house
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.delete = (req, res) => {
	let { id } = req.params
	Teacher.remove({_id: id})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.resetPin = (req, res) => {
	let { id } = req.params
	Teacher.findByIdAndUpdate(id, {
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
	return Teacher.find(null, null, {
		sort: {
			name: 1
		}
	})
	.select('-_id name house pin')
	.then(_teachers => {
		let teachers = _teachers.map(s => s.toJSON())
		teachers.unshift({
			name: 'Name',
			house: 'House',
			pin: 'Pin'
		})
		const csvString = Papa.unparse(teachers, {header: false})
		fs.writeFileSync(path.resolve(__dirname, '../static/downloads/pins/teacher.csv'), csvString)
	})
}

exports.bulkCreate = (req, res, next) => {
	const { teachers } = req.post
	let usedPins = []
	Teacher.remove({}) // remove all existing ones
	.then(() => Teacher.collection.insert(
		teachers
		.map((t, i) => {
			// generate a random pin
			let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
			while (usedPins.indexOf(pin) != -1) {
				// get a new pin.
				pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
			}
			return {
				name: t[0],
				house: t[1],
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