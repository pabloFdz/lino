// $( "#picker-background" ).on( "input", function() {
//   $('body').append('<style>body.custom{--background:' + $('#picker-background').val() + ' !important}</style>')
// });
// $('body').addClass('custom')



$('.custom-picker').on( "input", function() {
	$('body').addClass('custom');
	$('#custom-styling').append('--' + $(this).attr('data-var-key') + ': ' + $(this).val() + '!important')
	
	// $('body').addClass('custom');
	// $('body').append('<style>body.custom{--background:' + $('#picker-background').val() + ' !important}</style>')
}