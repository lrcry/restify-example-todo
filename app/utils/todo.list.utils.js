TodoListUtils = {
	createTodoListObject: function(reqBody, todoListObj) {
		todoListObj.title = reqBody.title || '';
		todoListObj.description = reqBody.description || '';
		todoListObj.isEnabled = reqBody.isEnabled == true ? true : false;
	}
}

module.exports = TodoListUtils;