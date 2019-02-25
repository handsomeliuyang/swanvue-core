import EventsEmitter from "./native/utils/events-emitter";
// 测试代码，输出Master，Slave里的日志
window.swanEvents = new EventsEmitter();
window.swanEvents.onMessage('TraceEvents', function (message) {
	console.log(message.params.eventName, message.params.data);
});

import Master from '../../dist/box/master/index.js';
import Native from './native/index.js';

const native = new Native(window);
window.master = new Master(window, window.swanInterface, window.swanComponents);

// Native应该提供的能力
// TODO-ly 下载此小程序的App相关的配置文件，初始化App
native.openWeChatApp('/wxs/helloworld');
