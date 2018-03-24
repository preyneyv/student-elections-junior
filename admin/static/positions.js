let positions = []

const table = $("#positions-table").DataTable({
	autoWidth: false,
	// paginate: false,
	ajax: {
		url: 'api/positions',
		dataSrc: (d) => positions = d.positions,
	},
	columns: [
		{data: 'position'},
		{data: 'gradeSpecific'},
		{data: 'sectionSpecific'},
		{data: 'houseSpecific'},
		{ // view candidates button
			mRender: (data, type, row) => `<button class="row-view-candidates" data-id="${row._id}">View ${row.candidates.length}</button>`
		},
		{ // action buttons
			mRender: function (data, type, row) {
				return `
					<i class="material-icons row-edit" data-id="${row._id}">edit</i>
					<i class="material-icons row-delete" data-id="${row._id}">delete</i>
				`
			}
		},
	],
	columnDefs: [
		{
			sortable: false,
			searchable: false,
			targets: ['nosort']
		},
		{
			targets: -1,
			className: 'actions'
		},
	],
	drawCallback: function() {
		console.log("Table drawn!")
		$("#positions-table .row-view-candidates").on('click', function () {
			const positionId = $(this).data('id')
			const position = positions.filter(p => p._id == positionId)[0]
			console.log(position)
			viewCandidatesModal.show(position)
		})
		$("#positions-table .row-delete").on('click', function() {
			const positionId = $(this).data('id')
			const position = positions.filter(p => p._id == positionId)[0]
			if (!confirm(`Are you sure you want to delete ${position.position}?`)) return;
			$("#position-table").css('pointer-events', 'none')
			axios.delete('api/positions/' + positionId)
			.then(() => {
				table.ajax.reload()
				$("#position-table").css('pointer-events', 'all')
			})
		})
		$("#positions-table .row-edit").on('click', function() {
			const positionId = $(this).data('id')
			const position = positions.filter(p => p._id == positionId)[0]
			editPositionModal.show(position)
		})
		$("#positions-table td:not()")
	}
})

// Create position modal code
new (function() {
	this.show = () => {
		$("#create-position-modal").addClass('show')
		$('#create-position-modal input').val('')
		$('#create-position-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#create-position-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#new-position-name").val() || null
		let gradeSpecific = $("#new-position-grade").val().split(/, ?/g).map(g => parseInt(g)).filter(g => !isNaN(g)) || null
		let sectionSpecific = $("#new-position-section").val() || null
		let houseSpecific = $("#new-position-house").val() || null

		axios.put('api/positions/', {
			name,
			gradeSpecific,
			sectionSpecific,
			houseSpecific
		})
		.then(response => response.data)
		.then(data => {
			that.show()
		})
	}
	$("#create-position-cancel-button").on('click', this.hide)
	$("#create-position-save-button").on('click', this.submit)
	$("#create-position-button").on('click', this.show)
})

// View candidates modal code
let viewCandidatesModal = new (function() {
	this.show = position => {
		$("#view-candidates-position-name").html(position.position)
		$("#view-candidates-table tbody").empty()
		_.sortBy(position.candidates, 'votes', 'desc')
		.reverse()
		.forEach(candidate => {
			$("<tr>")
			.append($("<td>"))
			.append($("<td>").html(candidate.name))
			.append($("<td>").html(candidate.grade))
			.append($("<td>").html(candidate.section))
			.append($("<td>").html(candidate.house))
			.append($("<td>").html(candidate.votes))
			.append($("<td>").html(candidate.teacherVotes))
			.append($("<td>").html(candidate.managementVotes))
			.appendTo("#view-candidates-table tbody")
		})
		$("#view-candidates-modal").addClass('show')
	}
	this.hide = () => {
		$("#view-candidates-modal").removeClass('show')
	}
	$("#view-candidates-close-button").on('click', this.hide)
})

let editPositionModal = new (function() {
	this.show = (position) => {
		this.position = position
		$("#edit-position-name").focus().val(position.position)
		$("#edit-position-grade").val(position.gradeSpecific)
		$("#edit-position-section").val(position.sectionSpecific)
		$("#edit-position-house").val(position.houseSpecific)
		$("#edit-position-modal").addClass('show')
	}
	this.hide = () => {
		$("#edit-position-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#edit-position-name").val() || null
		let gradeSpecific = $("#edit-position-grade").val().split(/, ?/g).map(g => parseInt(g)).filter(g => !isNaN(g)) || null
		let sectionSpecific = $("#edit-position-section").val() || null
		let houseSpecific = $("#edit-position-house").val() || null

		axios.patch('api/positions/' + that.position._id, {
			name,
			gradeSpecific,
			sectionSpecific,
			houseSpecific
		})
		.then(response => response.data)
		.then(data => {
			that.hide()
		})
	}
	$("#edit-position-cancel-button").on('click', this.hide)
	$("#edit-position-save-button").on('click', this.submit)
})