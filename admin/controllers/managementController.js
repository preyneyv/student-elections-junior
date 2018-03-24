const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')

const { Management } = require("../../database")

exports.list = (req, res) => {
	Management.find({})
	.then(management => res.send({success: true, management}))
}

exports.create = (req, res) => {
	let { name } = req.post
	let existingPins = []
	Management.find()
	.select('pin')
	.then(management => {
		existingPins = management.map(s => s.pin)
		if (existingPins.length == 10000) {
			return res.send({success: false, message: "cant_support_more_management"})
		}
		let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		while (existingPins.indexOf(pin) != -1) {
			// get a new pin.
			pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		}
		return (new Management({
			name, pin
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
	let { name } = req.post

	Management.findByIdAndUpdate(id, {
		name
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.delete = (req, res) => {
	let { id } = req.params
	Management.remove({_id: id})
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false, message: "unexpected"})
		throw e
	})
}
exports.resetPin = (req, res) => {
	let { id } = req.params
	Management.findByIdAndUpdate(id, {
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
	return Management.find(null, null, {
		sort: {
			name: 1
		}
	})
	.select('-_id name pin')
	.then(_management => {
		let management = _management.map(s => s.toJSON())
		management.unshift({
			name: 'Name',
			pin: 'Pin'
		})
		const csvString = Papa.unparse(management, {header: false})
		fs.writeFileSync(path.resolve(__dirname, '../static/downloads/pins/management.csv'), csvString)
	})
}

exports.bulkCreate = (req, res, next) => {
	const { management } = req.post
	let usedPins = []
	Management.remove({}) // remove all existing ones
	.then(() => Management.collection.insert(
		management
		.map((m, i) => {
			// generate a random pin
			let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
			while (usedPins.indexOf(pin) != -1) {
				// get a new pin.
				pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
			}
			return {
				name: m[0],
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