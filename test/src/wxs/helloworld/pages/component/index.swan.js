((global)=>{

	global.errorMsg = [];
	var templateComponents = Object.assign({}, {});
	var param = {};
	var filterArr = JSON.parse("[]");
	try {
		filterArr && filterArr.forEach(function (item) {
			param[item.module] = eval(item.module)
		});

		var pageContent = '<div>{{name}}</div>';

		var renderPage = function (filters, modules) {
			// 路径与该组件映射
			// var customAbsolutePathMap = (global.componentFactory.getAllComponents(), {});

			// 当前页面使用的自定义组件
			// const pageUsingComponentMap = JSON.parse("{}");

			// 生成该页面引用的自定义组件
			// const customComponents = Object.keys(pageUsingComponentMap).reduce((customComponents, customName) => {
			// 	customComponents[customName] = customAbsolutePathMap[pageUsingComponentMap[customName]];
			// 	return customComponents;
			// }, {});
			global.pageRender(pageContent, templateComponents)
		};

		renderPage(filterArr, param);
	} catch (e) {
		global.errorMsg['execError'] = e;
		throw e;
	}
})(window);