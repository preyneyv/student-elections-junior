let teachers = []

const table = $("#teachers-table").DataTable({
	autoWidth: false,
	// paginate: false,
	ajax: {
		url: 'api/teachers',
		dataSrc: (d) => teachers = d.teachers,
	},
	columns: [
		{data: 'name'},
		{data: 'pin'},
		{data: 'house'},
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
		$("#teachers-table .row-delete").one('click', function() {
			const teacherId = $(this).data('id')
			const teacher = teachers.filter(t => t._id == teacherId)[0]
			if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) return;
			$("#teachers-table").css('pointer-events', 'none')
			axios.delete('api/teachers/' + teacherId)
			.then(() => {
				table.ajax.reload()
				$("#teachers-table").css('pointer-events', 'all')
			})
		})
		$("#teachers-table .row-edit").one('click', function() {
			const teacherId = $(this).data('id')
			const teacher = teachers.filter(t => t._id == teacherId)[0]
			editTeacherModal.show(teacher)
		})
		$("#teachers-table .row-reset-pin").one('click', function() {
			const teacherId = $(this).data('id')
			const teacher = teachers.filter(c => c._id == teacherId)[0]
			if (!confirm(`Are you sure you want to reset ${teacher.name}'s pin?`)) return;
			$("#teachers-table").css('pointer-events', 'none')
			axios.post(`api/teachers/${teacherId}/reset`)
			.then(() => {
				table.ajax.reload()
				$("#teachers-table").css('pointer-events', 'all')
			})
		})
	}
})


// Create modal code
new (function() {
	this.show = () => {
		$("#new-teacher-modal").addClass('show')
		$('#new-teacher-modal input').val('')
		$('#new-teacher-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#new-teacher-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#new-teacher-name").val()
		let house = $("#new-teacher-house").val()
		
		let data = new FormData()
		data.append('name', name)
		data.append('house', house)
		
		axios.put('api/teachers/', data)
		.then(() => that.hide())
	}
	$("#new-teacher-cancel-button").on('click', this.hide)
	$("#new-teacher-save-button").on('click', this.submit)
	$("#create-teacher-button").on('click', this.show)
	$("#new-teacher-modal").show()
})


let editTeacherModal = new (function() {
	this.show = (teacher) => {
		this.teacher = teacher
		$("#edit-teacher-name").focus().val(teacher.name)
		$("#edit-teacher-house").val(teacher.house)
		$("#edit-teacher-modal").addClass('show')
	}
	this.hide = () => {
		$("#edit-teacher-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#edit-teacher-name").val()
		let house = $("#edit-teacher-house").val()
		
		let data = new FormData()
		data.append('name', name);
		data.append('house', house);

		axios.patch('api/teachers/' + that.teacher._id, data)
		.then(response => response.data)
		.then(data => {
			that.hide()
		})
	}
	$("#edit-teacher-cancel-button").on('click', this.hide)
	$("#edit-teacher-save-button").on('click', this.submit)
	$("#edit-teacher-modal").show()
})