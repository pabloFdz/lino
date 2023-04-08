/*
with keyboard or MIDI controller - set CUE points to replay on keysteoke

HTMLMediaElement.preservesPitch
https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch
*/
let rateGrowthInterval;
let currentRate = $('#rate').val();

let loopStart = document.querySelector("#loop-start");
let loopEnd = document.querySelector("#loop-end");
let loopStartTimestamp;
let loopEndTimestamp;

audio.controls = "true";
audio.autoplay = "true"


$(document).ready(function() {
	setPresetStyles(getPresetStyles());
	setCustomStyles(getCustomStyles());
});

function customSettings() {
	$('#custom-settings').toggle();
}

function customPickerStyling() {
	let customStyle = '<style>body.custom{';
	
	$( ".custom-picker" ).each(function() {
	  customStyle += '--' + $(this).attr('data-var-key') + ': ' + $(this).val() + ';';
	});
	
	customStyle += '}</style>';
	
	setCustomStyles(customStyle);
	saveCustomStyles(customStyle);
}

function changeHandler({
  target
}) {
  // Make sure we have files to use
  if (!target.files.length) return;

  // Create a blob that we can use as an src for our audio element
  const urlObj = URL.createObjectURL(target.files[0]);

  // Clean up the URL Object after we are done with it
  audio.addEventListener("load", () => {
    URL.revokeObjectURL(urlObj);
  });

  // Set the src and start loading the audio from the file
  audio.src = urlObj;
  
  rateListener();
  pitchListener();
  addAudio();
}

function pitchListener() {
	const pitch = document.querySelector("#pitch");

	pitch.addEventListener("change", () => {
	  if ("preservesPitch" in audio) {
	    audio.preservesPitch = pitch.checked;
	  } else if ("mozPreservesPitch" in audio) {
	    audio.mozPreservesPitch = pitch.checked; // deprecated
	  }
	});
}

function rateListener() {
	rate.addEventListener("input", () => (audio.playbackRate = rate.value));
}

function startAutoRate() {
	$('#start-auto-rate').prop('disabled', true);
	$('#stop-auto-rate').prop('disabled', false);
	
	rateGrowth = $('#rate-growth').val();
	secondsGrowth = $('#seconds-growth').val() * 1000;
	rateGrowthInterval = setInterval(frame, secondsGrowth);
	
	function frame() {
		currentRate = $('#rate').val();
	  	currentRate = Math.round( (parseFloat(currentRate) + parseFloat($('#rate-growth').val())) * 100) / 100
	  	$('#rate').val(currentRate);
	  	setCurrentPitchValue();
	  	audio.playbackRate = $('#rate').val();
	}
}

function setVolumeValue() {
	audio.volume = $('#volume').val();
}

function addAudio() {
	rateListener();
	pitchListener();
	document.querySelector("#audio-player-container").append(audio);
	$('#info-choose-song').hide();
}
$('#loop').click(function() {
	if ($(this).prop('checked')) {
		$('.loop-setting').show();
	}
	else {
		$('.loop-setting').hide();
		loopFull.checked = false;
		loopPartially.checked = false;
		$('.loop-setting-partially').hide();

		if (typeof loopInterval == 'undefined') {
		    return;
		}
		clearInterval(loopInterval);
	}
});
$(loopFull).click(function() {
	toggleLoopFull();
	$('.loop-setting-partially').hide();

	if (typeof loopInterval == 'undefined') {
	    return;
	}
	clearInterval(loopInterval);
})
$(loopPartially).click(function() {
	$('.loop-setting-partially').show();
	toggleLoopFull();
})

$('#loop-partially-action').click(function() {
	enableLoopPartially();
})
function toggleLoopFull() {
	audio.loop = loopFull.checked;
}
function enableLoopPartially() {
	loopInterval = setInterval(checkLoop, 300);
	loopStartTimestamp = $(loopStart).val();
	loopEndTimestamp = $(loopEnd).val();

	function checkLoop() {
		if (audio.currentTime >= loopEndTimestamp) {
			audio.pause();

			audio.currentTime = loopStartTimestamp;
			audio.play()
		}
	}
}

document.getElementById("loop-start").addEventListener("input", enablePartiallyButton);
document.getElementById("loop-end").addEventListener("input", enablePartiallyButton);
function enablePartiallyButton() {
	let loopStart = $('#loop-start').val();
	let loopEnd = $('#loop-end').val();

	if (loopStart != undefined && loopStart > 0 && loopEnd != undefined && loopEnd > 0) {
		$('#loop-partially-action').prop('disabled', false);
	}
	else {
		$('#loop-partially-action').prop('disabled', true);
	}
}

function stopAutoRate() {
	clearInterval(rateGrowthInterval);
	enableAuto();
	$('#stop-auto-rate').prop('disabled', true);
}

function rateReset() {
	$('#rate').val(1);
	currentRate = $('#rate').val();
	audio.playbackRate = $('#rate').val();
	setCurrentPitchValue();
}

function setCurrentPitchValue() {
	$('#current-pitch').text($('#rate').val());
}

function enableAuto() {
	let rateGrowth = $('#rate-growth').val();
	let secondsGrowth = $('#seconds-growth').val();

	if (rateGrowth != undefined && rateGrowth > 0 && secondsGrowth != undefined && secondsGrowth > 0) {
		$('#start-auto-rate').prop('disabled', false);
	}
	else {
		$('#start-auto-rate').prop('disabled', true);
	}
}

document.getElementById("audio-upload").addEventListener("change", changeHandler);
document.getElementById("rate-growth").addEventListener("input", enableAuto);
document.getElementById("seconds-growth").addEventListener("input", enableAuto);

$('#rate').on('input', function() {
	setCurrentPitchValue();
})

$('#volume').on('input', function() {
	setVolumeValue();
})

$('.track').click(function() {
	$('.track.menu-item').removeClass('selected')
	$(this).addClass('selected');
	let trackName = $(this).attr('data-track-name');
	trackName = `music/${trackName}.mp3`;
	audio.src = trackName;
	addAudio();
});

$('.menu-item').click(function() {
	let containerToShow = $(this).attr('data-click-action');
	$(`#${containerToShow}`).toggle();
	$(this).toggleClass('selected');
});

$('.theme-color').click(function() {
	removeCustomStyles();
	$('body').removeAttr('class').addClass($(this).attr('data-color'));
	savePresetStyling();
});