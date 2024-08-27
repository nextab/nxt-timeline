(function($) {
    $(document).ready(function() {
        // Initialize color pickers
        $('.color-picker-input').wpColorPicker();

        // Handle color type selection
        $('.color-type-select').on('change', function() {
            var $select = $(this);
            var $colorContainer = $select.next('.color-input-container');
            var $cssVarInput = $colorContainer.next('.css-var-input');

            if ($select.val() === 'color') {
                $colorContainer.show();
				$colorContainer.css({
					'display': 'inline-block',
					'vertical-align': 'top',
					'margin-left': '0.5rem'
				});
                $cssVarInput.hide();
            } else {
                $colorContainer.hide();
                $cssVarInput.show();
				$cssVarInput.css({
					'display': 'inline-block',
					'vertical-align': 'top',
					'margin-left': '0.5rem'
				});
            }
        });
    });
})(jQuery);