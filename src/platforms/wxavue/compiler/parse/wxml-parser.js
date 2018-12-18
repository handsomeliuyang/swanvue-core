export function hookParseStart (tag, attrs, unary) {
  if (tag === 'view') {
    tag = 'div'
  }

  if (tag === 'text') {
    tag = 'div'
  }


  for (var i=0; i<attrs.length; i++) {
    var attr = attrs[i]

    if (attr.name === 'bindtap') {
      attr.name = 'v-on:click'
    }
  }

  return { tag, attrs, unary }
}
