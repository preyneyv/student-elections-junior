"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
var touchScreen = false;

var numberRegex = /[0-9]/;
var pageTemplate = Handlebars.compile($("#voting-page-template").html());
var confirmTemplate = Handlebars.compile($("#confirm-votes-template").html());

$(window).one('touchstart', () => {
	touchScreen = true;
	$('body').addClass('touch')
})

$("#pin-input").on('keypress', function (e) {
	var code = e.which || e.code
	e.key = e.key || String.fromCharCode(code)	

	if (!numberRegex.test(e.key) || $("#pin-input").val().length === 4) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	if ($("#pin-input").val().length === 3) {
		setTimeout(function () {
			var pin = ("0000" + parseInt($("#pin-input").val())).substr(-4,4); 
			submitPin(pin);
			$("#pin-input").prop('disabled', true).blur();
		}, 300);
	}
});

function submitPin(_pin) {
	pin = _pin;
	axios.post('./api/check', { pin: pin }).then(function (response) {
		return response.data;
	}).then(function (data) {
		if (data.success) {
			if (confirm("Are you " + data.name + "?")) {
				axios.get('./api/fetch?pin=' + pin).then(function (response) {
					return response.data;
				}).then(function (data) {
					if (data.success) {
						createViews(data.positions);
					} else {
						alert("An unexpected error occured.");
						throw "WHAT HAPPENED?!";
					}
				});
			} else {
				alert("Please check your pin.");
				$("#pin-input").val("").prop('disabled', false).focus();
			}
		} else {
			alert("Pin incorrect or already used.");
			$("#pin-input").val("").prop('disabled', false).focus();
		}
	});
}

var currentPage = void 0,
    votes = {},
    positions = void 0,
    finishedVotingPass = false,
    pin = void 0;

function createViews(_positions) {
	positions = _positions;
	var pages = positions.map(function (position, pageIndex) {
		var page = $(pageTemplate(_extends({}, position, { pageIndex: pageIndex })));
		// bind listeners here
		page.find('.candidate').on('click', clickCandidate);
		return page;
	});
	$("#container").append(pages);

	currentPage = 0;
	$(window).on('resize', function () {
		scrollWindowToCurrent()
	});
	setTimeout(function () {
		return scrollWindowToCurrent();
	}, 200);
}

function scrollWindowToCurrent() {
	var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
	var scrollTop = $(".voting-page").eq(currentPage).position().top;
	
	if (touchScreen) {
		// use cheaper animation
		$("#container").addClass('hide')
		setTimeout(() => {
			$("#container").scrollTop($("#container").scrollTop() + scrollTop)
			$("#container").removeClass('hide')
			setTimeout(() => cb(), 250)
		}, 250)
	} else {
		$('#container').stop().animate({ scrollTop: "+=" + scrollTop }, 500, cb);
	}
}

function clickCandidate() {
	var candidateId = $(this).data('candidateId');
	var positionId = $(this).parents('.voting-page').data('positionId');
	var pageIndex = $(this).parents('.voting-page').data('pageIndex');
	votes[positionId] = candidateId;

	if (finishedVotingPass) {
		currentPage = positions.length;
	} else {
		currentPage++;
	}
	console.log(currentPage)
	if (currentPage === positions.length) {
		// VOTING DONE
		showConfirmPage();
		finishedVotingPass = true;
	}
	scrollWindowToCurrent();
}

function showConfirmPage() {
	var confirmVotes = Object.keys(votes).map(function (positionId) {
		var candidateId = votes[positionId];
		var position = positions.filter(function (p) {
			return p['_id'] == positionId;
		})[0];
		var candidate = position.candidates.filter(function (c) {
			return c['_id'] == candidateId;
		})[0];
		return _extends({}, position, {
			candidate: candidate
		});
	});
	console.log(confirmVotes);
	console.log(votes);
	var page = $(confirmTemplate({ votes: confirmVotes, currentPage: currentPage }));
	page.find('.vote').on('click', rewindToVote);
	page.find('.voting-page-submit').on('click', submitVotes);
	if (touchScreen) page.find('.help-text').html('(tap to change)');
	$('#container').append(page);
}

function rewindToVote() {
	var positionId = $(this).data('positionId');
	var pageIndex = $(".voting-page[data-position-id=" + positionId + "]").data('pageIndex');
	currentPage = pageIndex;
	scrollWindowToCurrent(function () {
		return $('.confirm-votes').remove();
	});
}

function submitVotes() {
	$('body').css('pointer-events', 'none');
	$('body').css('opacity', '0.6');
	axios.post('api/submit/', { votes: votes, pin: pin }).then(function () {
		alert('Thank you for voting. Your vote has been cast!');
		window.location.reload();
	});
}

// disable confirm for testing
//confirm = function confirm() {
//	return true;
//};
