const { Settings } = require('../database')

const getState = () => Settings.findOne({
	key: 'state'
})
.then(setting => {
	if (setting) {
		return setting.value
	} else {
		return {
			stage: 0
		}
	}
})

exports.index = (req, res) => {
	getState().then(state => {
		switch (state.stage) {
			case 0:
				res.render('registrationsOpen')
			case 1:
				res.render('registrationsClosed')
			case 2:
				res.render('candidateListing')
			case 3:
				res.render('studentVoting')
			case 4:
				break
		}
	})
}

exports.checkVoting = (req, res, next) => {
	getState()
	.then(state => {
		if (state.stage === 3) {
			next()
		} else {
			res.sendStatus(404)
		}
	})
}