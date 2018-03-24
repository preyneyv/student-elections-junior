let students = []

const table = $("#students-table").DataTable({
	autoWidth: false,
	// paginate: false,
	ajax: {
		url: 'api/students',
		dataSrc: (d) => students = d.students,
	},
	columns: [
		{data: 'name'},
		{data: 'pin'},
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
		{mRender: (data, type, row) => row.used ? "Used" : "Not Used"},
		{mRender: (data, type, row) => row.voted ? "Voted" : "Not Voted"},
		{ // action buttons
			mRender: function (data, type, row) {
				return `
					<i class="material-icons row-reset-pin" data-id="${row._id}">autorenew</i>
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
		$("#students-table .row-delete").on('click', function() {
			const studentId = $(this).data('id')
			const student = students.filter(c => c._id == studentId)[0]
			if (!confirm(`Are you sure you want to delete ${student.name}?`)) return;
			$("#students-table").css('pointer-events', 'none')
			axios.delete('api/students/' + studentId)
			.then(() => {
				table.ajax.reload()
				$("#students-table").css('pointer-events', 'all')
			})
		})
		$("#students-table .row-edit").on('click', function() {
			const studentId = $(this).data('id')
			const student = students.filter(c => c._id == studentId)[0]
			editStudentModal.show(student)
		})
		$("#students-table .row-reset-pin").on('click', function() {
			const studentId = $(this).data('id')
			const student = students.filter(c => c._id == studentId)[0]
			if (!confirm(`Are you sure you want to reset ${student.name}'s pin?`)) return;
			$("#students-table").css('pointer-events', 'none')
			axios.post(`api/students/${studentId}/reset`)
			.then(() => {
				table.ajax.reload()
				$("#students-table").css('pointer-events', 'all')
			})
		})
	}
})


// Create modal code
new (function() {
	this.show = () => {
		$("#new-student-modal").addClass('show')
		$('#new-student-modal input').val('')
		$('#new-student-modal input').eq(0).focus()
	}
	this.hide = () => {
		$("#new-student-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#new-student-name").val()
		let grade = $("#new-student-grade").val()
		let section = $("#new-student-section").val()
		let house = $("#new-student-house").val()
		
		let data = new FormData()
		data.append('name', name)
		data.append('grade', grade)
		if (section) data.append('section', section);
		data.append('house', house)
		
		axios.put('api/students/', data)
		.then(() => that.hide())
	}
	$("#new-student-cancel-button").on('click', this.hide)
	$("#new-student-save-button").on('click', this.submit)
	$("#create-student-button").on('click', this.show)
	$("#new-student-modal").show()
})


let editStudentModal = new (function() {
	this.show = (student) => {
		this.student = student
		$("#edit-student-name").focus().val(student.name)
		$("#edit-student-grade").val(student.grade)
		$("#edit-student-section").val(student.section)
		$("#edit-student-house").val(student.house)
		$("#edit-student-modal").addClass('show')
	}
	this.hide = () => {
		$("#edit-student-modal").removeClass('show')
		table.ajax.reload()
	}
	this.submit = () => {
		const that = this
		let name = $("#edit-student-name").val()
		let grade = $("#edit-student-grade").val()
		let section = $("#edit-student-section").val() || null
		let house = $("#edit-student-house").val()
		
		let data = new FormData()
		data.append('name', name);
		data.append('grade', grade);
		if (section) data.append('section', section);
		data.append('house', house);

		axios.patch('api/students/' + that.student._id, data)
		.then(response => response.data)
		.then(data => {
			that.hide()
		})
	}
	$("#edit-student-cancel-button").on('click', this.hide)
	$("#edit-student-save-button").on('click', this.submit)
	$("#edit-student-modal").show()
})