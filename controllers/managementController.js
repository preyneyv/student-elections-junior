const { Candidate, Position, Management } = require("../database")

exports.check = (req, res) => {
	const { pin } = req.post
	Management.findOne({
		pin,
		used: false
	})
	.then(management => {
		if (management) {
			res.send({
				success: true,
				name: management.name
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
	Management.findOneAndUpdate({
		pin,
		used: false
	}, {
		used: true
	}, { 
		new: true
	})
	.then(management => {
		if (!management) throw "management_not_found";
		return Position.find()
		.select('_id candidates position')
	})
	.then(_positions => {
		const promises = _positions.map(_position =>
			Candidate.find({
				_id: { $in: _position.candidates.map(c => c.candidateId) }
			})
			.select('image name tagline _id')
			.then(candidates => {
				const position = _position.toJSON()
				position.candidates = candidates
				positions.push(position)
			})
		)

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
	Management.findOneAndUpdate({
		pin,
		voted: false,
	}, {
		voted: true,
	}, { 
		new: true
	})
	.then(management => {
		if (!management) throw "management_not_found";
	})
	.then(() => {
		let promises = Object.keys(votes).map(positionId => {
			const candidateId = votes[positionId]
			return Position.findOneAndUpdate({
				_id: positionId,
				'candidates.candidateId': candidateId
			}, {
				$inc: {
					'candidates.$.managementVotes': 1
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