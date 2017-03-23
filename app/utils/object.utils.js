let ObjectUtils = {
	setObjectDefaultFields: (obj) => {
		obj.createAt = new Date();
		obj.avail = true;
		obj.version = 0;
	}
}

module.exports = ObjectUtils;