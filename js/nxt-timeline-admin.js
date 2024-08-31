jQuery(document).ready(function($) {
    // Element type change handler
    $('#element_type').on('change', function() {
        var elementType = $(this).val();
        var isCustom = elementType === 'custom';
        var isNone = elementType === 'none';
        
        // Toggle visibility and disable rows for standard elements
        $('#element_stroke_width_row, #element_fill_color_row, #element_stroke_color_row').each(function() {
            var $row = $(this);
            if (isCustom || isNone) {
                $row.addClass('disabled');
                $row.find('input, select').prop('disabled', true);
            } else {
                $row.removeClass('disabled');
                $row.find('input, select').prop('disabled', false);
            }
        });

        // Toggle visibility and disable rows for custom SVG
        $('#custom_svg_row, #custom_svg_width_row').each(function() {
            var $row = $(this);
            if (isCustom) {
                $row.removeClass('disabled');
                $row.find('input, select').prop('disabled', false);
            } else {
                $row.addClass('disabled');
                $row.find('input, select').prop('disabled', true);
            }
        });
    });

    // Initial state for element type
    $('#element_type').trigger('change');

    // Remove SVG button handler
    $('#remove_svg').on('click', function() {
        $('input[name="nxt_timeline_options[custom_svg]"]').val('');
        $(this).parent().remove();
    });

    // Path style change handler
    $('#path_style').on('change', function() {
        var isDashed = $(this).val() === 'dashed';
        $('input[name="nxt_timeline_options[path_dash_length]"]').prop('disabled', !isDashed);
        $('input[name="nxt_timeline_options[path_dash_gap]"]').prop('disabled', !isDashed);
    });

	// Media uploader for custom SVG
	$('#upload_svg_button').on('click', function(e) {
		e.preventDefault();
		console.log('Upload button clicked'); // Debug log

		var button = $(this);
		var mediaUploader;

		if (mediaUploader) {
			mediaUploader.open();
			return;
		}

		mediaUploader = wp.media({
			title: button.data('title') || 'Choose SVG',
			button: {
				text: button.data('button-text') || 'Use this SVG'
			},
			multiple: false,
			library: {
				type: 'image/svg+xml'
			}
		});

		mediaUploader.on('select', function() {
			var attachment = mediaUploader.state().get('selection').first().toJSON();
			console.log('Selected attachment:', attachment); // Debug log
			$('#custom_svg_id').val(attachment.id);
			$('#custom_svg_url').val(attachment.url);
			$('#remove_svg').show();
		});

		mediaUploader.open();
	});

	$('#remove_svg').on('click', function() {
		console.log('Remove button clicked'); // Debug log
		$('#custom_svg_id').val('');
		$('#custom_svg_url').val('');
		$(this).hide();
	});
    // Enable/disable scroll effect handler
	$('input[name="nxt_timeline_options[enable_scroll_effect]"]').on('change', function() {
        var isEnabled = $(this).is(':checked');
        // You can add additional logic here if needed
    });

	// Scroll effect type change handler
    $('#scroll_effect_type').on('change', function() {
        var isCustom = $(this).val() === 'custom';
        $('input[name="nxt_timeline_options[scroll_effect_custom_filter]"]').prop('disabled', !isCustom);
    });

    // Initial state for scroll effect type
    $('#scroll_effect_type').trigger('change');

    // Initial state for path style
    $('#path_style').trigger('change');

    // Range input handlers
    $('input[type="range"]').each(function() {
        var $input = $(this);
        var $value = $input.next('span');
        
        $input.on('input', function() {
            $value.text(this.value);
        });
    });
	console.log('nxt-timeline-admin.js loaded');
});