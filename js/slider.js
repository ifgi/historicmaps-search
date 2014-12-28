


function setSliderRange(valMin,valMax,ValRangeMin,ValRangeMax) {


	$("#slider").rangeSlider({
		bounds: {min: ValRangeMin, max: ValRangeMax},
		defaultValues: {min: valMin, max: valMax}
	});


	
}




