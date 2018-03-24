let management = []

const table = $("#management-table").DataTable({
	autoWidth: false,
	// paginate: false,
	ajax: {
		url: 'api/management',
		dataSrc: (d) => management = d.management,
	},
	columns: [
		{data: 'name'},
		{data: 'pin'},
		{mRender: (data, type, row) => row.used ? "Used" : "Not Used"},
		{mRender: (data, type, row) => row.voted ? "Voted" : "Not Voted"},
		{ // action buttons
			mRender: function (data, type, row) {
				let outputstring = `
					<i class="material-icons row-edit" data-id="${row._id}">edit</i>
					<i class="material-icons row-delete" data-id="${row._id}">delete</i>
				`
				if (row.used) {
					outputstring = `<i class="material-icons row-reset-pin" data-id="${row._id}">autorenew</i>` + outputstring
				} else {
					outputstring = `<i class="material-icons disabled row-reset-pin" data-id="${row._id}">autorenew</i>` + outputstring
				}
				return outputstring
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
			targets: [-2,-3],
			className: 'voting-status'
		},
		{
			targets: -1,
			className: 'actions'
		},
	],
	drawCallback: function() {
		console.log("Table drawn!")
		$("#management-table .row-delete").one('click', function() {
			const managementId = $(this).data('id')
			const mgmt = management.filter(t => t._id == managementId)[0]
			if (!confirm(`Are you sure you want to delete ${mgmt.name}?`)) return;
			$("#management-table").css('pointer-events', 'none')
			axios.delete('api/management/' + managementId)
			.then(() => {
				table.ajax.reload()
				$("#management-table").css('pointer-events', 'all')
			})
		})
		$("#management-table .row-edit").one('click', function() {
			const managementId = $(this).data('id')
			const mgmt = management.filter(t => t._id == managementId)[0]
			editTeacherModal.show(mgmt)
		})
		$("#management-table .row-reset-pin").one('click', function() {
			const managementId = $(this).data('id')
			const mgmt = management.filter(c => c._id == managementId)[0]
			if (!confirm(`Are you sure you want to reset ${mgmt.name}'s pin?`)) return;
			$("#management-table").css('pointer-events', 'none')
			axios.post(`api/management/${managementId}/reset`)
			.then(() => {
				table.ajax.reload()
				$("#management-table").css('pointer-events', 'all')
			})
		})
	}
})


// Create modal code
new (function() {
	this.show = () => {
		$("#new-management-modal").addClass('show')
		$('#new-management-modal input').val('')
		$('#new-management-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#new-management-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#new-management-name").val()
		let house = $("#new-management-house").val()
		
		let data = new FormData()
		data.append('name', name)
		data.append('house', house)
		
		axios.put('api/management/', data)
		.then(() => that.hide())
	}
	$("#new-management-cancel-button").on('click', this.hide)
	$("#new-management-save-button").on('click', this.submit)
	$("#create-management-button").on('click', this.show)
	$("#new-management-modal").show()
})


let editTeacherModal = new (function() {
	this.show = (management) => {
		this.management = management
		$("#edit-management-name").focus().val(management.name)
		$("#edit-management-house").val(management.house)
		$("#edit-management-modal").addClass('show')
	}
	this.hide = () => {
		$("#edit-management-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#edit-management-name").val()
		let house = $("#edit-management-house").val()
		
		let data = new FormData()
		data.append('name', name);
		data.append('house', house);

		axios.patch('api/management/' + that.management._id, data)
		.then(response => response.data)
		.then(data => {
			that.hide()
		})
	}
	$("#edit-management-cancel-button").on('click', this.hide)
	$("#edit-management-save-button").on('click', this.submit)
	$("#edit-management-modal").show()
})