const removeNullableProperty = (obj) => {
	return Object.fromEntries(Object.entries(obj).filter(([, v]) => v));
};

module.exports.RemoveNullableProperty = removeNullableProperty;
