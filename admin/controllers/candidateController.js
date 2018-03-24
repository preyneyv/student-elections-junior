const path = require('path')
const fs = require('fs')
const { Candidate, Position, Student } = require("../../database")

exports.list = (req, res) => {
	Candidate.find({})
	.then(candidates => res.send({success: true, candidates}))
}
exports.create = (req, res) => {
	const { name, grade, section, house } = req.post
	const { image } = req.files

	const candidate = new Candidate({
		name,
		grade, 
		section,
		house
	})
	const imageName = candidate._id + path.extname(image.name)
	candidate.image = imageName

	image.mv(path.resolve(studentElectionsJunior.imagesDir, imageName))

	candidate.save()
	.then(() => res.send({success: true}))
	.catch(e => {
		res.status(500).send({success: false})
		throw e
	})
}
exports.update = (req, res) => res.send({success: false})

exports.delete = (req, res) => {
	const { id } = req.params
	Candidate.findById(id)
	.then(candidate => {
		if (candidate) {
			const imagePath = path.resolve(studentElectionsJunior.imagesDir, candidate.image)
			fs.unlinkSync(imagePath)
			candidate.remove()
			.then(() => res.send({success: true}))

		} else {
			res.status(400).send({success: false, message: "bad_candidate_id"})
		}
	})
	.catch(e => {
		res.status(500).send({success: false})
		throw e
	})
}

exports.addAbstain = (req, res, next) => {
	const abstainUser = new Candidate({
		name: "Abstain",
		image: "abstain.png"
	})
	abstainUser.save()
	.then(() =>
		Position.update({}, {
			$push: {
				candidates: {
					candidateId: abstainUser._id,
					votes: 0
				}
			}
		},
		{multi: true}
	))
	.then(() => next())
	.catch(e => {
		res.status(500).send({success: false})
		throw e
	})
}