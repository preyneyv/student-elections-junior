const candidateTemplate = Handlebars.compile($("#candidate-template").html())

function renderCandidate(candidate) {
	const candidateCard = $(candidateTemplate(candidate))

	candidateCard.find('.candidate-submit')
	.on('click', submitCandidate)

	$("#content").append(candidateCard)
}

function submitCandidate() {
	
}