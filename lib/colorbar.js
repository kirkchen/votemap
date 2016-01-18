function ColorBar(value) {
	if(value.length <=0){
		return {
			name: null,
			value: null
		}
	}

  var color = {
    name: value[0].pt,
    value: null
  }

  switch (color.name) {
    case '民主進步黨':
      color.value = 'green';
      break;
    case '中國國民黨':
      color.value = 'blue';
      break;
    case '時代力量':
      color.value = 'yellow';
      break;
    default:
      color.value = null;
      break;
  }

  return color;
}
