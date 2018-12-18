/* @flow */

/**
 * Turn <view> into <div>
 * Turn <text> into <div>
 * Turn <button bindtap='xxx'> into <button v-on:click='xxx'>
 */

import {
  addRawAttr,
  getAndRemoveAttr
} from 'compiler/helpers'

function preTransformNode (el: ASTElement, options: CompilerOptions) {
  if(el.tag === 'view' || el.tag === 'text'){
    el.tag = 'div';
  }

  if(el.tag === 'button') {
    let val = getAndRemoveAttr(el, 'bindtap', true)
    if (val) {
      addRawAttr(el, 'v-on:click', val);
    }
  }
}

export default {
  preTransformNode
}
