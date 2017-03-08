TodoListUtils = {
	createTodoListObject: function(reqBody, todoListObj) {
		todoListObj.setTitle(reqBody.title);
		todoListObj.setDescription(reqBody.description);
		todoListObj.setEnabled(reqBody.isEnabled);
	}
}

module.exports = TodoListUtils;