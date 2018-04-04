const fs = require("fs")

const words = fs.readFileSync(__dirname + '/words.txt').toString().split('\n\n').map(r => r.split('\n'))
const generatePassword = () => {
	let adj = words[0][Math.floor(Math.random() * words[0].length)]
	adj = adj[0].toUpperCase() + adj.substr(1).toLowerCase()
	let noun = words[1][Math.floor(Math.random() * words[1].length)]
	noun = noun[0].toUpperCase() + noun.substr(1).toLowerCase()
	return adj + noun
}