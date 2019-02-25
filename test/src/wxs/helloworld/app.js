window.define("130",
	function (t, e, n, o, a, i, s, c, r, u, d, l, g, w, f, h) {
		Page({
			data: {
				name: 'helloworld'
			},
			onLoad: function () {
				console.log("Lifecycle Page onLoad");
			},
			onReady: function () {
				console.log("Lifecycle Page onReady");
			},
			onShow: function (e) {
				console.log("Lifecycle Page onShow");
			},
			onHide: function () {
				console.log("Lifecycle Page onHide");
			},
			onUnload: function () {
				console.log("Lifecycle Page onUnload");
			}
		})
});

window.define("138",
	function(t, e, n, o, a, i, s, c, r, u, d, l, g, w, f, h) {
		var p = [];
		Page({
			data: {
				text: "这是一段文字."
			},
			onShow: function(t) {
				p = []
			},
			add: function(t) {
				p.push("其他文字");
				this.setData({
					text: "这是一段文字." + p.join(",")
				})
			},
			remove: function(t) {
				p.length > 0 && (p.pop(), this.setData({
					text: "这是一段文字." + p.join(",")
				}))
			}
		})
});

window.define("193",
	function(t, e, n, o, a, i, s, c, r, u, d, l, g, w, f, h) {
		App({
			onLaunch: function(t) {
				console.log("Lifecycle App onLaunch")
			},
			onShow: function(t) {
				console.log("Lifecycle App onShow")
			}
		})
});

window.__swanRoute = "app";
window.usingComponents = [];
require("193");

// window.__swanRoute = "page/component/index";
// window.usingComponents = [];
// require("130");

window.__swanRoute = "pages/text/text";
window.usingComponents = [];
require("138");
