
function setSliderRange(valMin,valMax,ValRangeMin,ValRangeMax) {

	console.log("#DEBUG slider.js -> setSliderRange() executed. ")

	$("#slider").rangeSlider({
		bounds: {min: ValRangeMin, max: ValRangeMax},
		defaultValues: {min: valMin, max: valMax},
    wheelMode: "scroll", wheelSpeed: 30,
		valueLabels: "change",
		  scales: [
  //** Primary scale
  {
    first: function(val){ return val; },
    next: function(val){ return val + 100; },
    stop: function(val){ return false; },
    label: function(val){ return val; },
    format: function(tickContainer, tickStart, tickEnd){ 
      tickContainer.addClass("myCustomClass");
    }
  },
  //** Secondary scale
  {
    first: function(val){ return val; },
    next: function(val){
      if (val % 100 === 90){
        return val + 20;
      }
      return val + 10;
    },
    stop: function(val){ return false; },
    label: function(){ return null; }
  }]
	

	});

  $("#slider").rangeSlider("values", valMin, valMax);  
  
	
}




