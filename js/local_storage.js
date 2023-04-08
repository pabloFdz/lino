function setPresetStyles(presetStyle) {
	if (localStorage.getItem('preset-styling') === null) {
	  return;
	}
	$('body').removeAttr('class').addClass(getPresetStyles());
}
function getPresetStyles() {
	return window.localStorage.getItem('preset-styling');
}
function savePresetStyling() {
	window.localStorage.setItem('preset-styling', $('body').attr('class'));
}



function setCustomStyles(customStyle) {
	if (localStorage.getItem('custom-styling') === null) {
	  return;
	}

	$('head').append(customStyle);
	$('body').removeAttr('class').addClass('custom');
}
function getCustomStyles() {
	return window.localStorage.getItem('custom-styling');
}
function saveCustomStyles(customStyle) {
	window.localStorage.setItem('custom-styling', customStyle);
	window.localStorage.removeItem('preset-styling');
}
function removeCustomStyles() {
	window.localStorage.removeItem('custom-styling');
	savePresetStyling();
}