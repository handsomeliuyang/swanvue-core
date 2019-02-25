var r = [];
Page({
	data: {
		text: "这是一段文字."
	},
	onShow: function(t) {
		r = []
	},
	add: function(t) {
		r.push("其他文字"),
			this.setData({
				text: "这是一段文字." + r.join(",")
			})
	},
	remove: function(t) {
		r.length > 0 && (r.pop(), this.setData({
			text: "这是一段文字." + r.join(",")
		}))
	}
})