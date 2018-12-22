/* @flow */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

// import { warn } from 'core/util/index'
// import { camelize, extend, isPrimitive } from 'shared/util'
// import {
//   mergeVNodeHook,
//   isAsyncPlaceholder,
//   getFirstComponentChild
// } from 'core/vdom/helpers/index'

export const navigatorProps = {
  url: String,
}

export default {
  name: 'navigator',
  props: navigatorProps,

  render (createElement: Function) {
    var self = this

    return createElement(
      'div',
      {
        on: {
          click: function (event) {
            window.open(self.url);
          }
        }
      },
      this.$slots.default
    );
  }
}
