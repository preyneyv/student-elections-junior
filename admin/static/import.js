$("#upload-button").on('click', () => {
	if (!confirm("Are you sure you want to delete all existing entries and create new ones? (This cannot be undone.)")) return;
	console.log("UPLOADING")
	const positionsFile = $("#positions-file")[0].files[0]
	const studentsFile = $("#students-file")[0].files[0]
	const teachersFile = $("#teachers-file")[0].files[0]
	const managementFile = $("#management-file")[0].files[0]
	if (!positionsFile || !studentsFile || !teachersFile || !managementFile) return alert("Please ensure you have selected all the files.");
	let positions, students, teachers, management
	function checkToUpload() {
		if (!positions || !students || !teachers || !management) return;
		axios.post("api/bulkCreate", {
			positions,
			students,
			teachers,
			management
		})
		.then(() => alert("Successfully imported data!"))
		.catch((e) => {
			alert("Oh no! An error occured!")
			throw e
		})
	}
	Papa.parse(positionsFile, {
		complete: (result) => {
			if (JSON.stringify(result.data[0]) != '["Position","Grade Specific","Section Specific","House Specific"]') {
				return alert("Your positions file does not match the format! Please ensure that you have kept the header row and try again.")
			}
			result.data.shift()
			positions = result.data
			checkToUpload()
		}
	})

	Papa.parse(studentsFile, {
		complete: (result) => {
			if (JSON.stringify(result.data[0]) != '["Name","Grade","Section","House"]') {
				return alert("Your students file does not match the format! Please ensure that you have kept the header row and try again.")
			}
			result.data.shift()
			students = result.data
			checkToUpload()
		}
	})

	Papa.parse(teachersFile, {
		complete: (result) => {
			if (JSON.stringify(result.data[0]) != '["Name","House"]') {
				return alert("Your teachers file does not match the format! Please ensure that you have kept the header row and try again.")
			}
			result.data.shift()
			teachers = result.data
			checkToUpload()
		}
	})

	Papa.parse(managementFile, {
		complete: (result) => {
			if (JSON.stringify(result.data[0]) != '["Name"]') {
				return alert("Your management file does not match the format! Please ensure that you have kept the header row and try again.")
			}
			result.data.shift()
			management = result.data
			checkToUpload()
		}
	})
})