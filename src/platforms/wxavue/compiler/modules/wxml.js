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
import {parseFilters} from "../../../../compiler/parser/filter-parser";

// 用于判断是否包含{{ }}的正则表达式
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function transformMustache (el: ASTElement, options: CompilerOptions) {
  const replaceAttrs = []
  for(var i=0; i<el.attrsList.length; i++){
    var attr = el.attrsList[i];

    const tagRE = defaultTagRE
    if (!tagRE.test(attr.value)) {
      continue
    }

    const tokens = []
    // const rawTokens = []
    let lastIndex = tagRE.lastIndex = 0
    let match, index
    while ((match = tagRE.exec(attr.value))) {
      index = match.index
      // push text token
      if (index > lastIndex) {
        tokens.push(`'${attr.value.slice(lastIndex, index)}'`)
      }
      // tag token
      const exp = match[1].trim()
      tokens.push(`(${exp})`)
      lastIndex = index + match[0].length
    }
    if (lastIndex < attr.value.length) {
      tokens.push(`'${attr.value.slice(lastIndex)}'`)
    }

    replaceAttrs.push({name: attr.name, value: tokens.join('+')});
  }
  for(let i=0; i<replaceAttrs.length; i++){
    const attr = replaceAttrs[i];

    getAndRemoveAttr(el, attr.name, true)
    addRawAttr(el, 'v-bind:'+attr.name, attr.value);
  }
}

function transformBindtap(el: ASTElement, options: CompilerOptions) {
  let val = getAndRemoveAttr(el, 'bindtap', true)
  if (val) {
    addRawAttr(el, 'v-on:click', val+'($event)');
  }

}

function preTransformNode (el: ASTElement, options: CompilerOptions) {
  // view ==> div, text ==> div
  if(el.tag === 'view' || el.tag === 'text'){
    el.tag = 'div';
  }

  if(el.tag === 'image'){
    el.tag = 'img';
  }

  // bindtap ==> v-on:click
  transformBindtap(el, options)

  // xx="item-{{id}}" ==> v-bind:id="'item-'+id"
  transformMustache(el, options)

}

export default {
  preTransformNode
}
