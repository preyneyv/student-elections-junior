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
				break
			case 2:
				break
			case 3:
				res.render('voting')
			case 4:
				break

		}
	})
}