import Vue from 'vue';
import Communicator from '../../utils/communication';
import swanEvents from '../../utils/swan-events';

/**
 * san的组件工厂，生产组件类
 * @class
 */
export default class SanFactory {
	constructor(componentDefaultProps, behaviors) {
		this.behaviors = behaviors;
		this.componentDefaultProps = componentDefaultProps;
		this.componentInfos = {};

		// 依赖池，所有的组件需要的依赖是工厂提供的
		const communicator = Communicator.getInstance(this.componentDefaultProps.swaninterface);
		this.dependenciesPool = {
			// san,
			communicator,
			...this.componentDefaultProps
		};
	}
	/**
	 * 创建组件的工厂方法
	 *
	 * @param {Object} componentName - 创建组件的名称
	 * @param {Object} options - 创建组件用的属性
	 */
	componentDefine(componentName, componentInfo = {}) {
		this.componentInfos[componentName] = {
			...componentInfo
		};
	}

	/**
	 * 获取所有的注册过的组件
	 *
	 * @return {Object} 获取的当前注册过的所有组件
	 */
	getAllComponents() {
		return this.getComponents();
	}
	/**
	 * 获取所有注册过的组件
	 *
	 * @param {string|Array} componentName - 需要获取的component的名称
	 * @return {Object} 获取的所有的注册的组件
	 */
	getComponents(componentName = this.getAllComponentsName()) {

		const componentNames = [].concat(componentName);

		const components = componentNames.reduce((componentSet, componentName) => {
			componentSet[componentName] = this.createComponents(componentName);
			return componentSet;
		}, {});

		return typeof componentName === 'string' ? components[componentName] : components;
	}

	/**
	 * 获取所有组件的名称
	 *
	 * @return {Array} 所有组件的名称集合
	 */
	getAllComponentsName() {
		return Object.keys(this.componentInfos);
	}

	/**
	 * 关键类，百度小程序通过san创建san的组件，我改为使用vue来创建组件
	 *
	 * @param {string} componentName - 需要创建的组件的名称
	 * @return {class} - 创建的组件
	 */
	createComponents(componentName) {

		const componentInfo = this.componentInfos[componentName];
		// if (componentInfo && componentInfo.createdClass) {
		// 	return componentInfo.createdClass;
		// }

		// 获取超类名称
		const superComponentName = componentInfo.superComponent || '';
		// 获取到当前组件的超类
		const superComponent = this.componentInfos[superComponentName] || {};

		// 原始的组件的原型
		// const originComponentPrototype = componentInfo.componentPrototype;

		// 获取超类名称
		// const superComponentName = originComponentPrototype.superComponent || 'swan-component';

		// 继承
		const mergedComponentOptions = this.mergeComponentOptions(
			superComponent.options,
			componentInfo.options
		);

		const mergedDependencies = (superComponent.dependencies || [])
			.reduce((r, v, k) => {
				r.indexOf(v) < 0 && r.push(v);
				return r;
			}, (componentInfo.dependencies || []));

		// 获取dependencies
		// const mergedDependencies = componentInfo.dependencies || [];
		// mergedDependencies.push(superComponent.dependencies);

		// 用merge好的proto来定义san组件(类)并返回
		const vueComponent = this.defineVueComponent(mergedDependencies, mergedComponentOptions);

		return vueComponent;

		// 返回修饰过的类
		// return this.behaviors(componentPrototype.behaviors || [], componentPrototype);
	}

	/**
	 * 将两个组件的proto给merge为一个
	 *
	 * @param {Object} targetProto - 被merge的组件proto
	 * @param {Object} mergeProto - 待merge入的组件proto
	 * @return {Object} merge结果
	 */
	mergeComponentOptions = (targetOptions, mergeOptions) => {
		// merge传入的proto
		return Object.keys(mergeOptions)
			.reduce((mergedClassProto, propName) => {
				switch (propName) {
					case 'constructor':
					case 'detached':
					case 'created':
						mergedClassProto[propName] = function (options) {
							targetOptions[propName] && targetOptions[propName].call(this, options);
							mergeOptions[propName] && mergeOptions[propName].call(this, options);
						};
						break;

					case 'computed':
						mergedClassProto['computed'] = Object.assign(
							{},
							mergedClassProto[propName],
							mergeOptions[propName]
						);
						break;

					default:
						mergedClassProto[propName] = mergeOptions[propName];
				}
				return mergedClassProto;
			}, {...targetOptions});
	}

	/**
	 * 传入proto，定义san组件(官网标准的定义san组件方法)
	 *
	 * @param {Object} proto 组件类的方法表
	 * @return {Function} san组件类
	 */
	defineVueComponent(dependencies, options) {

		// function Component(options) {
		// 	san.Component.call(this, options);
		// 	proto.constructor && proto.constructor.call(this, options);
		// }
		//
		// san.inherits(Component, san.Component);
		//
		// Object.keys(proto)
		// 	.forEach(propName => {
		// 		if (propName !== 'constructor') {
		// 			Component.prototype[propName] = proto[propName];
		// 		}
		// 	});

		console.log('defineVueComponent', options);

		const Component = Vue.extend(options);

		Component.getInitData = function(params){
			options = {
				data: {

				}
			};
			for (var k in params.value) {
				// this.data.set();
				// this.$set(this.$data, k, params.value[k]);
				options.data[k] = params.value[k];
			}
			return options;
		};

		Component.slaveLoaded = function () {
			console.log(`Slave 发送 slaveLoaded 事件，slaveId=${window.slaveId}`);
			window.testutils.clientActions.dispatchEvent('slaveLoaded', {
				value: {
					status: 'loaded'
				},
				slaveId: window.slaveId
			});
		};

		// const obj = {
		// 	component: Component,
		// 	getInitData: function(params){
		// 		options = {
		// 			data: {
		//
		// 			}
		// 		};
		// 		for (var k in params.value) {
		// 			// this.data.set();
		// 			// this.$set(this.$data, k, params.value[k]);
		// 			options.data[k] = params.value[k];
		// 		}
		// 		return options;
		// 	},
		// 	slaveLoaded: function () {
		// 		console.log(`Slave 发送 slaveLoaded 事件，slaveId=${window.slaveId}`);
		// 		window.testutils.clientActions.dispatchEvent('slaveLoaded', {
		// 			value: {
		// 				status: 'loaded'
		// 			},
		// 			slaveId: window.slaveId
		// 		});
		// 	}
		// };

		// 用组件依赖装饰组件原型，生成组件原型
		const componentPrototype = this.decorateComponentPrototype(dependencies);
		Object.keys(componentPrototype)
			.forEach(propName => {
				if (propName !== 'constructor') {
					Component[propName] = componentPrototype[propName];
					Component.prototype[`$${propName}`] = componentPrototype[propName];
				}
			});

		return Component;
	}

	/**
	 * 使用装饰器装饰组件原型
	 *
	 * @param {Object} componentPrototype 组件原型
	 * @param {Object} componentInfo 组件原始传入的构造器
	 * @return {Object} 装饰后的组件原型
	 */
	decorateComponentPrototype(dependencies) {

		// 所有的组件的依赖在依赖池寻找后的结果
		const newDependencies = dependencies.reduce((depends, depsName) => {
				depends[depsName] = this.dependenciesPool[depsName];
				return depends;
			}, {});

		// merge后的组件原型，可以用来注册san组件
		return newDependencies;
	}

}

/**
 * 获取component的生产工厂
 *
 * @param {Object} componentDefaultProps - 默认的组件的属性
 * @param {Object} componentProtos - 所有组件的原型
 * @param {Object} behaviors - 所有的组件装饰器
 * @return {Object} 初始化后的componentFactory
 */
export const getComponentFactory = (componentDefaultProps, component, behaviors) => {

	swanEvents('slavePreloadGetComponentFactory');

	const sanFactory = new SanFactory(componentDefaultProps, behaviors);

	swanEvents('slavePreloadDefineComponentsStart');

	Object.keys(component)
		.forEach(protoName => sanFactory.componentDefine(protoName, component[protoName]));

	swanEvents('slavePreloadDefineComponentsEnd');

	return sanFactory;
};