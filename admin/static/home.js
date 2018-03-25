let appStage = new (function() {
	let stopPoints = [0, 247, 498, 749, 1000]
	let slider = $("#app-stage")
	const setPosition = (position) => $({val: slider.val()}).animate({val: position}, {
		step: (val) => slider.val(val)
	})
	$("#app-stage-table tr:eq(1) td").on('click', function() {
		let i = $(this).index()
		$("#app-stage-table").addClass('disabled')
		updateState({ stage: i })
		.then(() => {
			setPosition(stopPoints[i])
			$("#app-stage-table tr:not(:first-child) td:nth-child("+(i+1)+")")
			.addClass('current')
			.siblings()
			.removeClass('current')
			$("#app-stage-table").removeClass('disabled')
		})
	})
	this.init = () => {
		$("#app-stage-table").removeClass('disabled')
		
		$("#app-stage-table tr:not(:first-child) td:nth-child("+(state.stage+1)+")")
		.addClass('current')
		.siblings()
		.removeClass('current')
		
		slider.val(stopPoints[state.stage])
	}
	$('body').bind('initall', this.init)
})