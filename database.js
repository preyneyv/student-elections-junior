const mongoose = require('mongoose');
const { Schema } = mongoose

mongoose.connect(studentElectionsSenior.dbUri)

const positionSchema = new Schema({
	position: String,
	gradeSpecific: [Number],
	sectionSpecific: {
		type: String,
		default: null
	},
	houseSpecific: {
		type: String,
		default: null
	},
	candidates: [
		{
			candidateId: Schema.Types.ObjectId,
			votes: {
				type: Number,
				default: 0
			},
			teacherVotes: {
				type: Number,
				default: 0
			},
			managementVotes: {
				type: Number,
				default: 0
			}
		}
	]
})

const candidateSchema = new Schema({
	name: String,
	grade: Number,
	section: String,
	house: String,
	tagline: {
		type: String,
		default: ""
	},
	description: {
		type: String,
		default: ""
	},
	image: String
})

const studentSchema = new Schema({
	pin: String,
	grade: Number,
	section: String,
	house: String,
	name: String,
	used: {
		type: Boolean,
		default: false
	},
	voted: {
		type: Boolean,
		default: false
	}
})

const teacherSchema = new Schema({
	pin: String,
	name: String,
	house: String,
	used: {
		type: Boolean,
		default: false
	},
	voted: {
		type: Boolean,
		default: false
	}
})

const managementSchema = new Schema({
	pin: String,
	name: String,
	used: {
		type: Boolean,
		default: false
	},
	voted: {
		type: Boolean,
		default: false
	}
})

module.exports = {
	Candidate: mongoose.model('Candidate', candidateSchema),
	Position: mongoose.model('Position', positionSchema),
	Student: mongoose.model('Student', studentSchema),
	Management: mongoose.model('Management', managementSchema),
	Teacher: mongoose.model('Teacher', teacherSchema)
}