const { Settings } = require("../../database")

exports.getState = (req, res) => {
	exports.state()
	.then(state => res.send({succes: true, state}))
}

exports.updateState = (req, res) => {
	let { state } = req.post
	Settings.findOneAndUpdate({
		key: 'state'
	},
	{ value: state },
	{
		new: true,
		upsert: true
	})
	.then(setting => res.send({success: true, state: setting.value}))
}

exports.state = () => Settings.findOne({
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

let sidebarTemplate = require('../static/sidebar.json')
exports.generateSidebar = (stage, url) => {
	let sidebar = JSON.parse(JSON.stringify({
		fixed: sidebarTemplate.fixed,
		dynamic: sidebarTemplate.dynamic[stage].sort((a,b) => a.title > b.title ? 1 : -1)
	}))
	let current = sidebar.fixed.filter(s => s.url == url)[0]
	if (current) current.current = true;
	current = sidebar.dynamic.filter(s => s.url == url)[0]
	if (current) current.current = true;
	return sidebar
}
exports.getValidUrls = (stage) => {
	return sidebarTemplate.fixed.map(s => s.url)
	.concat(sidebarTemplate.dynamic[stage].map(s => s.url))
}