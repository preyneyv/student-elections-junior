let state, sidebar
$(window).on('load', () => {
	axios.get('api/state')
	.then(response => response.data)
	.then(data => state = data.state)
	.then(() => $('body').trigger('initall'))
	.then(() => axios.get('sidebar.json'))
	.then(response => response.data)
	.then(data => sidebar = data)
})
function updateState(changes) {
	state = { ...state, ...changes }
	return axios.post('api/state', { state })
	.then(response => response.data)
	.then(data => state = data.state)
	.then(() => $('body').trigger('statechanged'))
}

$("body").bind('statechanged', () => {
	// update sidebar
	let sidebarEntries = sidebar.dynamic[state.stage].sort((a,b) => a.title > b.title ? 1 : -1)
	let existingUrls = []
	$('#sidebar .stage-based').each(function() {
		const entry = $(this)
		const url = entry.attr('href').substr(1)
		let sidebarEntry = sidebarEntries.filter(s => s.url == url) [0]
		if (sidebarEntry) {
			existingUrls.push(url)
		} else {
			entry.slideUp(function() {$(this).remove()})
		}
	})
	sidebarEntries.forEach(entry => {
		// skip existing entries in the sidebars
		if (existingUrls.indexOf(entry.url) != -1) return;
		const link = $("<a>")
		link.attr("href", '.' + entry.url)
		link.text(entry.title)
		link.addClass('stage-based')
		link.insertBefore('#sidebar a:not(.stage-based):eq(0)')
		link.hide().slideDown()
	})
})