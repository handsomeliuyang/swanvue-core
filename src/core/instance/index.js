

function DiyVue (options) {

    // 此方法构造函数，只能通过new来构建对象，不能直接调用，如何区分，通过this来区分
    if (process.env.NODE_ENV !== 'production' && !(this instanceof DiyVue)){
        warn('DiyVue is a constructor and should be called with the `new` keyword')
    }



}

export default DiyVue