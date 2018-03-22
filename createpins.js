global.studentElectionsSenior = require('./config')
const { Teacher } = require('./database')

const pins = require('./teacherpins')

const map = pins.map(teacherDetails => {
	const teacher = new Teacher({
		...teacherDetails,
		pin: ("0000" + teacherDetails.pin).substr(-4,4)
	})
	return teacher.save()
})

Promise.all(map)
.then(() => console.log("SAVED"))