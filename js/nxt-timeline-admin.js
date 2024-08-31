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
});