const { Candidate, Position, Student } = require("../database")

exports.check = (req, res) => {
	const { pin } = req.post
	Student.findOne({
		pin,
		used: false
	})
	.then(student => {
		if (student) {
			res.send({
				success: true,
				name: student.name
			})
		} else {
			res.send({
				success: false
			})
		}
	})
}

exports.fetch = (req, res) => {
	const { pin } = req.get
	let positions = []
	Student.findOneAndUpdate({
		pin,
		used: false
	}, {
		used: true
	}, { 
		new: true
	})
	.then(student => {
		if (!student) throw "student_not_found";
		const { grade, section, house } = student
		console.log(grade, section, house)
		return Position.find()
		.and([
			{ $or: [ {gradeSpecific: { $size: 0 }}, {gradeSpecific: grade} ] },
			{ $or: [ {sectionSpecific: null}, {sectionSpecific: section} ] },
			{ $or: [ {houseSpecific: null}, {houseSpecific: house} ] }
		])
		.select('_id candidates position')
	})
	.then(_positions => {
		const promises = _positions.map(_position => Candidate.find({
			_id: { $in: _position.candidates.map(c => c.candidateId) }
		})
		.select('image name tagline _id')
		.then(candidates => {
			const position = _position.toJSON()
			position.candidates = candidates
			positions.push(position)
		}))

		return Promise.all(promises)
	})
	.then(() => positions = positions.sort((a,b) => a.position > b.position))
	.then(() => res.send({success: true, positions}))
	.catch(e => {
		if (typeof e == "string") {
			res.send({success: false, message: e})
		} else {
			res.status(500).send({success: false, message: "unexpected"})
			throw e
		}
	})
}

exports.submit = (req, res) => {
	const { pin, votes } = req.post
	Student.findOneAndUpdate({
		pin,
		voted: false,
	}, {
		voted: true,
	}, { 
		new: true
	})
	.then(student => {
		if (!student) throw "student_not_found";
	})
	.then(() => {
		let promises = Object.keys(votes).map(positionId => {
			const candidateId = votes[positionId]
			return Position.findOneAndUpdate({
				_id: positionId,
				'candidates.candidateId': candidateId
			}, {
				$inc: {
					'candidates.$.votes': 1
				}
			})
		})
		return Promise.all(promises)
	})
	.then(() => res.send({success: true}))
	.catch(e => {
		if (typeof e == "string") {
			res.send({success: false, message: e})
		} else {
			res.status(500).send({success: false, message: "unexpected"})
			throw e
		}
	})	
}