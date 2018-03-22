const express = require("express")
const app = express()
const adminApp = require('./admin')

function init() {
	const expressHandlebars = require("express-handlebars")
	app.engine('hbs', expressHandlebars())
	app.set('view engine', 'hbs')
	app.set('views', __dirname + "/client/views")

	studentElectionsJunior = require("./config.json")
	require("./routes/clientRoutes")(app)

	adminApp.init()
}

if (module.parent) {
	// Running as module
	module.exports = [app, adminApp, init]
} else {
	// Running directly
	const server = require("http").createServer(app)
	const clientSessions = require('client-sessions')

	global.io = require('socket.io').listen(server)

	const appName = require('./package.json').name.replace(/-([a-z])/g, g => g[1].toUpperCase());
	app.use(clientSessions({
		cookieName: "session",
		secret: "this is a secret"
	}))
	global[appName] = {}
	app.init()

	server.listen(3000, () => console.log("Subapp running on port 3000!"))
}
