const path = require('path')
const fs = require('fs')
const Papa = require('papaparse')

const { Teacher } = require("../../database")

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
	Teacher.remove({}) // remove all existing ones
	.then(() => Teacher.collection.insert(
		teachers
		.sort(() => .5 - Math.random())
		.map((t, i) => {
			// generate a random pin
			const pin = i + 1000 + ""
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