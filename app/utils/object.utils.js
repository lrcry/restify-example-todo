let ObjectUtils = {
	setObjectDefaultFields: (obj) => {
		obj.setCreateAt(new Date());
	}
}

module.exports = ObjectUtils;