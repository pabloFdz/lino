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

let buffer = .1;

let pitchValue = true;

$(document).ready(function() {
	setPresetStyles(getPresetStyles());
	setCustomStyles(getCustomStyles());
});

function customSettings() {
	$('#custom-settings').toggle();
}
$('.custom-picker').on( "input", function() {
	$('#custom-styling').empty()
	$('body').removeAttr('class').addClass('custom');
	$( ".custom-picker" ).each(function() {
		$('#custom-styling').append('body.custom{--' + $(this).attr('data-var-key') + ': ' + $(this).val() + '!important}')
	})
	
})
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

  loadWaveSurfer(urlObj);
}

function checkBufferSize() {
	let bufferSize = $('#buffer-growth').val();
	bufferSize = parseFloat(bufferSize);
	bufferSize = bufferSize.toFixed(2);
	bufferSize = parseFloat(bufferSize);
	return bufferSize;
}
function decreaseBufferSize() {
	let bufferSize = checkBufferSize();
	bufferSize = bufferSize - 0.01;
	bufferSize = bufferSize.toFixed(2);
	bufferSize = parseFloat(bufferSize);
	$('#buffer-growth').val(bufferSize);
	buffer = bufferSize;
}
function increaseBufferSize() {
	let bufferSize = checkBufferSize();
	bufferSize = bufferSize + 0.01;
	bufferSize = bufferSize.toFixed(2);
	bufferSize = parseFloat(bufferSize);
	$('#buffer-growth').val(bufferSize);
	buffer = bufferSize;
}
function commonRate() {
	let rate = $('#rate-growth').val();
	rate = parseFloat(rate);
	rate = rate.toFixed(2);
	rate = parseFloat(rate);
	return rate;
}
function decreaseRate() {
	let rate = commonRate();
	rate = rate - 0.01;
	rate = rate.toFixed(2);
	rate = parseFloat(rate);
	$('#rate-growth').val(rate);
}
function increaseRate() {
	let rate = commonRate();
	rate = rate + 0.01;
	rate = rate.toFixed(2);
	rate = parseFloat(rate);
	$('#rate-growth').val(rate);
}
function decreaseRateTime() {
	let rate = $('#seconds-growth').val() * 1;
	if (rate === 1) {
		return;
	}
	rate = rate - 1;
	$('#seconds-growth').val(rate);
}
function increaseRateTime() {
	let rate = $('#seconds-growth').val() * 1;
	rate = rate + 1;
	$('#seconds-growth').val(rate);
}
function startAutoRate() {
	stopAutoRate()
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
	  	wavesurfer.setPlaybackRate($('#rate').val(), pitchValue);
	}
}

$(loopFull).click(function() {
	$('#loop-action').prop('disabled', false);
	toggleLoop();
	disablePartially();
})
$(loopPartially).click(function() {
	$('#loop-action').prop('disabled', true);
	toggleLoop();
	enablePartially();
})
function enablePartially() {
	$('#loop-start').removeAttr('disabled')
	$('#loop-end').removeAttr('disabled')
}
function disablePartially() {
	$('#loop-start').attr('disabled', true)
	$('#loop-end').attr('disabled', true)
}

$('#loop-action').click(function() {
	loopStatus = true;
	toggleLoop($('input[name="loop"]:checked').val());
})
let loopStatus = false;
function toggleLoop(type) {
	if (typeof(type) == "undefined") {
		loopStatus = false;
		$('#loop-action').text("Start Loop")
		return;
	}

	let duration = wavesurfer.getDuration().toFixed(2);

	if (type == "full") {
		loopStartTimestamp = 0;
		loopEndTimestamp = duration;
	}
	else if (type == "partially") {
		loopStartTimestamp = $(loopStart).val();
		loopEndTimestamp = $(loopEnd).val();
	}

	$('#loop-action').text("Looping")

	let sec = loopStartTimestamp / duration;

	wavesurfer.on("timeupdate", (currentTime) => {
		if (!loopStatus) {
			return;
		}

	  if(currentTime > loopEndTimestamp - buffer){
	      currentTime = loopStartTimestamp;
	      wavesurfer.seekTo(sec);
	  }
	})
}

document.getElementById("loop-start").addEventListener("input", enablePartiallyButton);
document.getElementById("loop-end").addEventListener("input", enablePartiallyButton);
function enablePartiallyButton() {
	let loopStart = $('#loop-start').val();
	let loopEnd = $('#loop-end').val();

	if (loopStart != undefined && loopStart > 0 && loopEnd != undefined && loopEnd > 0 && loopEnd != loopStart) {
		$('#loop-action').prop('disabled', false);
	}
	else {
		$('#loop-action').prop('disabled', true);
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
	wavesurfer.setPlaybackRate($('#rate').val(), pitchValue);
	setCurrentPitchValue();
}

function setCurrentPitchValue() {
	$('#current-pitch').text($('#rate').val());
}

function enableAuto() {
	let rateGrowth = $('#rate-growth').val();
	let secondsGrowth = $('#seconds-growth').val();

	if (rateGrowth != undefined && secondsGrowth != undefined && secondsGrowth > 0) {
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
	pitchValue = document.getElementById('pitch').checked;
	wavesurfer.setPlaybackRate(rate.value, pitchValue)
})
$('#pitch').on('input', function() {
	pitchValue = document.getElementById('pitch').checked;
	wavesurfer.setPlaybackRate(rate.value, pitchValue)
})

$('#volume').on('input', function() {
	setVolumeValue();
})

$('.track').click(function() {
	let trackName = $(this).attr('data-track-file');
	trackName = `music/${trackName}.mp3`;
	loadWaveSurfer(trackName);

	$('.track.menu-item').removeClass('selected')
	$(this).addClass('selected');

	$('.track').removeClass('playing');
	$('.track.loop').attr('src', 'img/vdisk1.png');
	$('.track.instrumental').attr('src', 'img/vdisk2.png');
	$(this).addClass('playing');
	$(this).attr('src', 'img/vdisk4.png');

	let title = $(this).attr('data-track-title') ? $(this).attr('data-track-title') : "Loop";
	let artist = $(this).attr('data-track-artist') ? $(this).attr('data-track-artist') : "No Artist";
	$('#track-title').text(title);
	$('#track-artist').text(artist);
});

$('.menu-item').click(function() {
	let containerToShow = $(this).attr('data-click-action');
	toggleVisibility($(`#${containerToShow}`));
	$(this).toggleClass('selected');
});
function toggleVisibility(e) {
	let display;
	if($(e).css("opacity") == "0") {
		$(e).css("opacity", 1);
		$(e).css("display", "block");
	}
	else {
		$(e).css("opacity", 0);
		setTimeout(() => {
		  $(e).css("display", "none")
		}, 300);
	}
}

$('.theme-color').click(function() {
	removeCustomStyles();
	$('body').removeAttr('class').addClass($(this).attr('data-color'));
	savePresetStyling();
});