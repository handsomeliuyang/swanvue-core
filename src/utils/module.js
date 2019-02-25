/**
 * @file module loader(define & require)
 * @author houyu(houyu01@baidu.com)
 */
import {pathResolver} from './path';
const MODULE_PRE_DEFINED = 1;
const MODULE_DEFINED = 2;
const global = window;
let modModules = {};

const parseId = baseId => {
	const idStructure = baseId.match(/(.*)\/([^/]+)?$/);
	return (idStructure && idStructure[1]) || './';
};

const createLocalRequire = (baseId, require) => id => {
	const normalizedId = parseId(baseId);
	const paths = pathResolver(normalizedId, id, () => {
		throw new Error(`can't find module : ${id}`);
	});
	const absId = paths.join('/').replace(/\.js$/g, '');
	return require(absId);
};

// 重写开发者使用的Function, 过滤new Function同时保留原型
const safetyFn = () => {
	const fn = (...args) => {
		const len = args.length;
		if (len > 0 && 'return this' === args[len - 1]) {
			return function () {
				return {};
			};
		}
	};
	fn.prototype = Function.prototype;
	Function.prototype.constructor = fn;
	return fn;
};

export const require = id => {
	if (typeof id !== 'string') {
		throw new Error('require args must be a string');
	}
	let mod = modModules[id];
	if (!mod) {
		throw new Error('module "' + id + '" is not defined');
	}

	if (mod.status === MODULE_PRE_DEFINED) {
		const factory = mod.factory;
		const house = {
			swan: global.swan || global.swaninterface.swan,
			swaninterface: global.swaninterface || global.masterManager.swaninterface,
			getApp: global.getApp
		}
		house.boxjs = house.swaninterface.boxjs;

		!mod.dependents.length && (mod.dependents = ['swan', 'getApp'])
		mod.dependents = mod.dependents.map(item => house[item])

		let localModule = {
			exports: {}
		};
		let factoryReturn = factory(
			createLocalRequire(id, require),
			localModule,
			localModule.exports,
			define,
			...mod.dependents
		);

		mod.exports = localModule.exports || factoryReturn;
		mod.status = MODULE_DEFINED;
	}
	return mod.exports;
};

// define 定义
export const define = (id, dependents, factory) => {
	if (typeof id !== 'string') {
		throw new Error('define args 0 must be a string');
	}
	let _deps = dependents instanceof Array ? dependents : [];
	let _factory = typeof dependents === 'function' ? dependents : factory;

	//本地缓存中已经存在
	if (modModules[id]) {
		return;
	}

	modModules[id] = {
		status: MODULE_PRE_DEFINED,
		dependents: _deps,
		factory: _factory
	};
};
