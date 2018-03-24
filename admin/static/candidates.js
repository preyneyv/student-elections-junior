let candidates = []

const table = $("#candidates-table").DataTable({
	autoWidth: false,
	// paginate: false,
	ajax: {
		url: 'api/candidates',
		dataSrc: (d) => candidates = d.candidates,
	},
	columns: [
		{data: 'name'},
		{
			data: 'grade',
			defaultContent: '<div style="text-align: center">&mdash;</div>'
		},
		{
			data: 'section',
			defaultContent: '<div style="text-align: center">&mdash;</div>'
		},
		{
			data: 'house',
			defaultContent: '<div style="text-align: center">&mdash;</div>'
		},
		{ // action buttons
			mRender: function (data, type, row) {
				if (row.name == "Abstain") {
					return "<i>No Actions</i>"
				} else {
					return `
						<i class="material-icons row-edit" data-id="${row._id}">edit</i>
						<i class="material-icons row-delete" data-id="${row._id}">delete</i>
					`
				}
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
		$("#candidates-table .row-delete").on('click', function() {
			const candidateId = $(this).data('id')
			const candidate = candidates.filter(c => c._id == candidateId)[0]
			if (!confirm(`Are you sure you want to delete ${candidate.name}?`)) return;
			$("#candidates-table").css('pointer-events', 'none')
			axios.delete('api/candidates/' + candidateId)
			.then(() => {
				table.ajax.reload()
				$("#candidates-table").css('pointer-events', 'all')
			})
		})
		$("#candidates-table .row-edit").on('click', function() {
			const candidateId = $(this).data('id')
			const candidate = candidates.filter(c => c._id == candidateId)[0]
			editCandidateModal.show(candidate)
		})
		$("#positions-table td:not()")
	}
})


// Create modal code
new (function() {
	this.show = () => {
		$("#create-candidate-modal").addClass('show')
		$('#create-candidate-modal input').val('')
		$('#create-candidate-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#create-candidate-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#new-candidate-name").val()
		let grade = $("#new-candidate-grade").val()
		let section = $("#new-candidate-section").val()
		let house = $("#new-candidate-house").val()
		let image = $("#new-candidate-image")[0].files[0]

		let data = new FormData()
		data.append('name', name)
		data.append('grade', grade)
		if (section) data.append('section', section);
		data.append('house', house)
		data.append('image', image)

		axios.put('api/candidates/', data)
		.then(() => that.hide())
	}
	$("#new-candidate-cancel-button").on('click', this.hide)
	$("#new-candidate-save-button").on('click', this.submit)
	$("#create-candidate-button").on('click', this.show)
})


let editCandidateModal = new (function() {
	this.show = (candidate) => {
		this.candidate = candidate
		$("#edit-candidate-name").focus().val(candidate.name)
		$("#edit-candidate-grade").val(candidate.grade)
		$("#edit-candidate-section").val(candidate.section)
		$("#edit-candidate-house").val(candidate.house)
		$("#edit-candidate-modal").addClass('show')
	}
	this.hide = () => {
		$("#edit-candidate-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#edit-candidate-name").val() || null
		let grade = $("#edit-candidate-grade").val() || null
		let section = $("#edit-candidate-section").val() || null
		let house = $("#edit-candidate-house").val() || null
		let image = $("#edit-candidate-image")[0].files[0]

		let data = new FormData()
		if (name) data.append('name', name);
		if (grade) data.append('grade', grade);
		if (section) data.append('section', section);
		if (house) data.append('house', house);

		if (image) data.append('image', image);
		axios.patch('api/candidates/' + that.candidate._id, data)
		.then(response => response.data)
		.then(data => {
			that.hide()
		})
	}
	$("#edit-candidate-cancel-button").on('click', this.hide)
	$("#edit-candidate-save-button").on('click', this.submit)
})