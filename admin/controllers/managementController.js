const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')

const { Management } = require("../../database")

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