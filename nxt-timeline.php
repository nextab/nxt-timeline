<?php
/*
Plugin Name: Animated Timeline
Description: Creates an animated timeline with SVG and JavaScript
Version: 1.0
Author: nexTab & Unleashed Design
Author URI: https://nextab.de
Text Domain: nxt-timeline
*/

#region Enqueue Scripts in frontend
function nxt_timeline_enqueue_scripts() {
    global $post;
    if (strpos($post->post_content, 'svg-target') === false) return;
    wp_register_script('nxt-timeline', plugin_dir_url(__FILE__) . 'js/nxt-timeline.js', false, '1.0', true);
    
    $options = get_option('nxt_timeline_options');
    // Ensure custom_svg_url is included in the options
    if (!empty($options['custom_svg_id'])) {
        $options['custom_svg_url'] = wp_get_attachment_url($options['custom_svg_id']);
    }
    wp_localize_script('nxt-timeline', 'nxtTimelineOptions', $options);
    wp_enqueue_script('nxt-timeline');
}
add_action('wp_enqueue_scripts', 'nxt_timeline_enqueue_scripts', 999999);
#endregion Enqueue Scripts in frontend

#region Enqueue Scripts in WP backend
function nxt_timeline_enqueue_admin_scripts($hook_suffix) {
    if ('settings_page_nxt_timeline' !== $hook_suffix) {
        return;
    }

    wp_enqueue_media();
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('wp-color-picker');

    $plugin_dir = plugin_dir_path(__FILE__);
    $plugin_url = plugin_dir_url(__FILE__);

    wp_enqueue_script(
        'nxt-timeline-color-picker', 
        $plugin_url . 'js/nxt-timeline-color-picker.js', 
        array('jquery', 'wp-color-picker'), 
        filemtime($plugin_dir . 'js/nxt-timeline-color-picker.js'), 
        true
    );

    wp_enqueue_script(
        'nxt-timeline-admin', 
        $plugin_url . 'js/nxt-timeline-admin.js', 
        array('jquery', 'wp-color-picker', 'media-upload', 'thickbox'), 
        filemtime($plugin_dir . 'js/nxt-timeline-admin.js'), 
        true
    );
}
add_action('admin_enqueue_scripts', 'nxt_timeline_enqueue_admin_scripts');
#endregion Enqueue Scripts in WP backend

#region Admin Page WP
// Add a menu item under the Settings menu
add_action('admin_menu', 'nxt_timeline_add_admin_menu');
function nxt_timeline_add_admin_menu() {
    add_options_page('Animated Timeline Settings', 'Animated Timeline', 'manage_options', 'nxt_timeline', 'nxt_timeline_options_page');
}

// Add settings link on plugin overview page
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'nxt_timeline_add_settings_link');
function nxt_timeline_add_settings_link($links) {
	$settings_link = '<a href="options-general.php?page=nxt_timeline">Settings</a>';
	array_unshift($links, $settings_link);
	return $links;
}
#endregion Admin Page WP

#region Settings for Admin Page
// Register settings
add_action('admin_init', 'nxt_timeline_settings_init');
function nxt_timeline_settings_init() {
    register_setting('nxt_timeline', 'nxt_timeline_options', 'nxt_timeline_sanitize_options');

    // Timeline Stops Section
    add_settings_section(
        'nxt_timeline_stops_section',
        'Timeline Stops',
        'nxt_timeline_stops_section_callback',
        'nxt_timeline'
    );

	add_settings_field(
        'offset_x',
        'Offset X',
        'nxt_timeline_offset_x_render',
        'nxt_timeline',
        'nxt_timeline_stops_section'
    );

    add_settings_field(
        'offset_y',
        'Offset Y',
        'nxt_timeline_offset_y_render',
        'nxt_timeline',
        'nxt_timeline_stops_section'
    );

    add_settings_field(
        'element_type',
        'Element Type',
        'nxt_timeline_element_type_render',
        'nxt_timeline',
        'nxt_timeline_stops_section'
    );

	add_settings_field(
		'custom_svg',
		'Custom SVG for Timeline Items',
		'nxt_timeline_custom_svg_render',
		'nxt_timeline',
		'nxt_timeline_stops_section'
	);

	add_settings_field(
		'custom_svg_width',
		'Custom SVG Width (px)',
		'nxt_timeline_custom_svg_width_render',
		'nxt_timeline',
		'nxt_timeline_stops_section'
	);

    add_settings_field(
        'element_stroke_width',
        'Element Stroke Width',
        'nxt_timeline_element_stroke_width_render',
        'nxt_timeline',
        'nxt_timeline_stops_section'
    );

	add_settings_section(
        'nxt_timeline_scroll_handler_section',
        'Scroll Effects',
        'nxt_timeline_scroll_handler_section_callback',
        'nxt_timeline'
    );

	add_settings_field(
		'enable_scroll_effect',
		'Enable Scroll Effect',
		'nxt_timeline_enable_scroll_effect_render',
		'nxt_timeline',
		'nxt_timeline_scroll_handler_section'
	);

	add_settings_field(
		'scroll_effect_type',
		'Scroll Effect Type',
		'nxt_timeline_scroll_effect_type_render',
		'nxt_timeline',
		'nxt_timeline_scroll_handler_section'
	);
	
	add_settings_field(
		'scroll_effect_transition',
		'Scroll Effect Transition (ms)',
		'nxt_timeline_scroll_effect_transition_render',
		'nxt_timeline',
		'nxt_timeline_scroll_handler_section'
	);
	
	add_settings_field(
		'scroll_effect_custom_filter',
		'Custom CSS Filter',
		'nxt_timeline_scroll_effect_custom_filter_render',
		'nxt_timeline',
		'nxt_timeline_scroll_handler_section'
	);

	add_settings_field(
		'invert_scroll_effect',
		'Invert Scroll Effect',
		'nxt_timeline_invert_scroll_effect_render',
		'nxt_timeline',
		'nxt_timeline_scroll_handler_section'
	);

    // Timeline Path Section
    add_settings_section(
        'nxt_timeline_path_section',
        'Timeline Path',
        'nxt_timeline_path_section_callback',
        'nxt_timeline'
    );
    
    add_settings_field(
        'path_style',
        'Path Style',
        'nxt_timeline_path_style_render',
        'nxt_timeline',
        'nxt_timeline_path_section'
    );

	add_settings_field(
		'path_dash_length',
		'Path Dash Length',
		'nxt_timeline_path_dash_length_render',
		'nxt_timeline',
		'nxt_timeline_path_section'
	);

	add_settings_field(
		'path_dash_gap',
		'Path Dash Gap',
		'nxt_timeline_path_dash_gap_render',
		'nxt_timeline',
		'nxt_timeline_path_section'
	);

    add_settings_field(
        'path_width',
        'Path Width',
        'nxt_timeline_path_width_render',
        'nxt_timeline',
        'nxt_timeline_path_section'
    );

    add_settings_field(
        'animated_path_width',
        'Animated Path Width',
        'nxt_timeline_animated_path_width_render',
        'nxt_timeline',
        'nxt_timeline_path_section'
    );

	// Customize Colors Section
    add_settings_section(
        'nxt_timeline_colors_section',
        'Customize Colors',
        'nxt_timeline_color_section_callback',
        'nxt_timeline'
    );

	$color_fields = [
        'element_fill_color',
        'element_stroke_color',
        'path_color',
        'animated_path_color'
    ];

	foreach ($color_fields as $field) {
        add_settings_field(
            $field . '_type',
            ucfirst(str_replace('_', ' ', $field)) . ' Type',
            'nxt_timeline_color_type_render',
            'nxt_timeline',
            'nxt_timeline_colors_section',
            ['field' => $field]
        );
    }

	// Customize the shape of the timeline path
	add_settings_section(
		'nxt_timeline_shape_section',
		'Customize Path Bend',
		'nxt_timeline_shape_section_callback',
		'nxt_timeline'
	);

	add_settings_field(
        'path_curve_vertical_offset',
        'Path Curve Vertical Offset',
        'nxt_timeline_path_curve_vertical_offset_render',
        'nxt_timeline',
        'nxt_timeline_shape_section'
    );

	add_settings_field(
        'path_curve_roundness',
        'Path Curve Roundness',
        'nxt_timeline_path_curve_roundness_render',
        'nxt_timeline',
        'nxt_timeline_shape_section'
    );

    add_settings_field(
        'path_curve_horizontal_offset',
        'Path Curve Horizontal Offset',
        'nxt_timeline_path_curve_horizontal_offset_render',
        'nxt_timeline',
        'nxt_timeline_shape_section'
    );

    add_settings_field(
        'path_curve_correct_last_y',
        'Path Correct Last Y Offset',
        'nxt_timeline_path_curve_correct_last_y_render',
        'nxt_timeline',
        'nxt_timeline_shape_section'
    );
}
#region Sanitization
function nxt_timeline_sanitize_options($options) {
	if (isset($options['custom_svg'])) {
		$options['custom_svg'] = esc_url_raw($options['custom_svg']);
    }
	if (isset($options['custom_svg_id'])) {
        $options['custom_svg_id'] = absint($options['custom_svg_id']);
        $options['custom_svg_url'] = wp_get_attachment_url($options['custom_svg_id']);
    } else {
        $options['custom_svg_id'] = '';
        $options['custom_svg_url'] = '';
    }
	if (isset($options['custom_svg_width'])) {
        $options['custom_svg_width'] = absint($options['custom_svg_width']);
    }
	
	$options['enable_scroll_effect'] = isset($options['enable_scroll_effect']) ? (bool) $options['enable_scroll_effect'] : false;
	$options['scroll_effect_type'] = isset($options['scroll_effect_type']) ? sanitize_text_field($options['scroll_effect_type']) : 'opacity';
    $options['scroll_effect_transition'] = isset($options['scroll_effect_transition']) ? absint($options['scroll_effect_transition']) : 300;
    $options['scroll_effect_custom_filter'] = isset($options['scroll_effect_custom_filter']) ? sanitize_text_field($options['scroll_effect_custom_filter']) : '';
	$options['invert_scroll_effect'] = isset($options['invert_scroll_effect']) ? (bool) $options['invert_scroll_effect'] : false;

    return $options;
}
#endregion Sanitization

function nxt_timeline_stops_section_callback() {
    echo '<p>Customize the appearance of timeline stops.</p>';
}

function nxt_timeline_path_section_callback() {
    echo '<p>Customize the appearance of the timeline path.</p>';
}

function nxt_timeline_color_section_callback() {
	echo '<p>Customize the colors of the timeline elements.</p>';
}

function nxt_timeline_shape_section_callback() {
	echo '<p>Customize the shape of the timeline path.</p>';
}

function nxt_timeline_scroll_handler_section_callback() {
	echo '<p>Customize the scroll effect of the timeline stops.</p>';
}
#endregion Settings for Admin Page

#region Render functions for each setting
function nxt_timeline_offset_x_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='number' name='nxt_timeline_options[offset_x]' value='<?php echo $options['offset_x'] ?? 40; ?>'>
    <?php
}

function nxt_timeline_offset_y_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='number' name='nxt_timeline_options[offset_y]' value='<?php echo $options['offset_y'] ?? 20; ?>'>
    <?php
}

function nxt_timeline_element_type_render() {
    $options = get_option('nxt_timeline_options');
    $current_type = $options['element_type'] ?? 'circle';
    ?>
    <select name='nxt_timeline_options[element_type]' id='element_type'>
        <option value='circle' <?php selected($current_type, 'circle'); ?>>Circle</option>
        <option value='square' <?php selected($current_type, 'square'); ?>>Square</option>
        <option value='custom' <?php selected($current_type, 'custom'); ?>>Custom SVG</option>
        <option value='none' <?php selected($current_type, 'none'); ?>>None</option>
    </select>
    <?php
}

function nxt_timeline_custom_svg_render() {
    $options = get_option('nxt_timeline_options');
    $custom_svg_id = isset($options['custom_svg_id']) ? $options['custom_svg_id'] : '';
    $custom_svg_url = $custom_svg_id ? wp_get_attachment_url($custom_svg_id) : '';
    ?>
    <div id="custom_svg_row" class="nxt-timeline-row">
        <input type="hidden" name="nxt_timeline_options[custom_svg_id]" id="custom_svg_id" value="<?php echo esc_attr($custom_svg_id); ?>">
        <input type="text" id="custom_svg_url" value="<?php echo esc_url($custom_svg_url); ?>" readonly>
        <button type="button" class="button" id="upload_svg_button" data-title="Choose SVG" data-button-text="Use this SVG">Select SVG</button>
        <?php if (!empty($custom_svg_url)) : ?>
            <button type="button" class="button" id="remove_svg">Remove</button>
        <?php endif; ?>
    </div>
    <?php
}

function nxt_timeline_custom_svg_width_render() {
    $options = get_option('nxt_timeline_options');
    $custom_svg_width = isset($options['custom_svg_width']) ? $options['custom_svg_width'] : 20;
    ?>
    <div id="custom_svg_width_row" class="nxt-timeline-row">
        <input type='number' name='nxt_timeline_options[custom_svg_width]' value='<?php echo esc_attr($custom_svg_width); ?>' min='1'>
        <p class="description">Specify the width of the custom SVG in pixels. Height will adjust automatically to maintain aspect ratio.</p>
    </div>
    <?php
}

function nxt_timeline_element_fill_color_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='color' name='nxt_timeline_options[element_fill_color]' value='<?php echo $options['element_fill_color'] ?? '#ffffff'; ?>'>
    <?php
}

function nxt_timeline_element_stroke_color_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='color' name='nxt_timeline_options[element_stroke_color]' value='<?php echo $options['element_stroke_color'] ?? '#6c1300'; ?>'>
    <?php
}

function nxt_timeline_element_stroke_width_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <div id="element_stroke_width_row" class="nxt-timeline-row">
        <input type='number' name='nxt_timeline_options[element_stroke_width]' value='<?php echo $options['element_stroke_width'] ?? 4; ?>'>
    </div>
    <?php
}

function nxt_timeline_enable_scroll_effect_render() {
    $options = get_option('nxt_timeline_options');
    $enable_scroll_effect = isset($options['enable_scroll_effect']) ? $options['enable_scroll_effect'] : false;
    ?>
    <input type='checkbox' name='nxt_timeline_options[enable_scroll_effect]' <?php checked($enable_scroll_effect, true); ?> value='1'>
    <label for='nxt_timeline_options[enable_scroll_effect]'>Apply effect to timeline stops after scrolling past</label>
    <?php
}

function nxt_timeline_scroll_effect_type_render() {
    $options = get_option('nxt_timeline_options');
    $effect_type = isset($options['scroll_effect_type']) ? $options['scroll_effect_type'] : 'opacity';
    ?>
    <select name='nxt_timeline_options[scroll_effect_type]' id='scroll_effect_type'>
        <option value='opacity' <?php selected($effect_type, 'opacity'); ?>>Opacity</option>
        <option value='invert' <?php selected($effect_type, 'invert'); ?>>Invert Color (circles and rectangles only)</option>
        <option value='grayscale' <?php selected($effect_type, 'grayscale'); ?>>Grayscale</option>
        <option value='custom' <?php selected($effect_type, 'custom'); ?>>Custom CSS Filter</option>
    </select>
    <?php
}

function nxt_timeline_scroll_effect_transition_render() {
    $options = get_option('nxt_timeline_options');
    $transition = isset($options['scroll_effect_transition']) ? $options['scroll_effect_transition'] : 300;
    ?>
    <input type='number' name='nxt_timeline_options[scroll_effect_transition]' value='<?php echo esc_attr($transition); ?>' min='0'>
    <p class="description">Transition duration in milliseconds</p>
    <?php
}

function nxt_timeline_scroll_effect_custom_filter_render() {
    $options = get_option('nxt_timeline_options');
    $custom_filter = isset($options['scroll_effect_custom_filter']) ? $options['scroll_effect_custom_filter'] : '';
    ?>
    <input type='text' name='nxt_timeline_options[scroll_effect_custom_filter]' value='<?php echo esc_attr($custom_filter); ?>' placeholder='e.g., blur(5px) or hue-rotate(180deg)'>
    <p class="description">
        Enter a valid CSS filter value. This will only be used if 'Custom CSS Filter' is selected as the effect type. 
        For color shifts, try combinations like 'sepia(100%) hue-rotate(180deg)' for a blue tint, 
        or 'sepia(100%) saturate(300%) brightness(70%) hue-rotate(180deg)' for a strong blue effect.
    </p>
    <?php
}

function nxt_timeline_invert_scroll_effect_render() {
    $options = get_option('nxt_timeline_options');
    $invert_scroll_effect = isset($options['invert_scroll_effect']) ? $options['invert_scroll_effect'] : false;
    ?>
    <input type='checkbox' name='nxt_timeline_options[invert_scroll_effect]' <?php checked($invert_scroll_effect, true); ?> value='1'>
    <label for='nxt_timeline_options[invert_scroll_effect]'>Invert scroll effect (apply effect first, remove when scrolled past)</label>
    <?php
}

function nxt_timeline_path_color_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='color' name='nxt_timeline_options[path_color]' value='<?php echo $options['path_color'] ?? '#25536E33'; ?>'>
    <?php
}

function nxt_timeline_path_style_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <select name='nxt_timeline_options[path_style]' id='path_style'>
        <option value='solid' <?php selected($options['path_style'], 'solid'); ?>>Solid</option>
        <option value='dashed' <?php selected($options['path_style'], 'dashed'); ?>>Dashed</option>
    </select>
    <?php
}

function nxt_timeline_path_dash_length_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='number' name='nxt_timeline_options[path_dash_length]' min='1' 
           value='<?php echo isset($options['path_dash_length']) ? $options['path_dash_length'] : 10; ?>'
           <?php echo $options['path_style'] !== 'dashed' ? 'disabled' : ''; ?>>
    <?php
}

function nxt_timeline_path_dash_gap_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='number' name='nxt_timeline_options[path_dash_gap]' min='1' 
           value='<?php echo isset($options['path_dash_gap']) ? $options['path_dash_gap'] : 5; ?>'
           <?php echo $options['path_style'] !== 'dashed' ? 'disabled' : ''; ?>>
    <?php
}

function nxt_timeline_path_width_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='number' name='nxt_timeline_options[path_width]' value='<?php echo $options['path_width'] ?? 3; ?>'>
    <?php
}

function nxt_timeline_animated_path_color_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='color' name='nxt_timeline_options[animated_path_color]' value='<?php echo $options['animated_path_color'] ?? '#25536E'; ?>'>
    <?php
}

function nxt_timeline_animated_path_width_render() {
    $options = get_option('nxt_timeline_options');
    ?>
    <input type='number' name='nxt_timeline_options[animated_path_width]' value='<?php echo $options['animated_path_width'] ?? 3; ?>'>
    <?php
}

function nxt_timeline_path_curve_roundness_render() {
    $options = get_option('nxt_timeline_options');
    $value = $options['path_curve_roundness'] ?? 80;
    ?>
    <input type='range' name='nxt_timeline_options[path_curve_roundness]' min='0' max='200' value='<?php echo $value; ?>'>
    <span class="path_curve_roundness_value"><?php echo $value; ?></span>
    <?php
}

function nxt_timeline_path_curve_vertical_offset_render() {
    $options = get_option('nxt_timeline_options');
    $value = $options['path_curve_vertical_offset'] ?? 85;
    ?>
    <input type='range' name='nxt_timeline_options[path_curve_vertical_offset]' min='0' max='200' value='<?php echo $value; ?>'>
    <span class="path_curve_vertical_offset_value"><?php echo $value; ?></span>
    <?php
}

function nxt_timeline_path_curve_horizontal_offset_render() {
    $options = get_option('nxt_timeline_options');
    $value = $options['path_curve_horizontal_offset'] ?? 100;
    ?>
    <input type='range' name='nxt_timeline_options[path_curve_horizontal_offset]' min='0' max='200' value='<?php echo $value; ?>'>
    <span class="path_curve_horizontal_offset_value"><?php echo $value; ?></span>
    <?php
}

function nxt_timeline_path_curve_correct_last_y_render() {
    $options = get_option('nxt_timeline_options');
    $value = $options['path_curve_correct_last_y'] ?? 0;
    ?>
    <input type='range' name='nxt_timeline_options[path_curve_correct_last_y]' min='-100' max='100' value='<?php echo $value; ?>'>
    <span class="path_curve_correct_last_y_value"><?php echo $value; ?></span>
    <?php
}

function nxt_timeline_color_type_render($args) {
    $options = get_option('nxt_timeline_options');
    $field = $args['field'];
    $type = $options[$field . '_type'] ?? 'color';
    $color_value = $options[$field] ?? '#000';
    $css_var_value = $options[$field . '_css_var'] ?? '';
    ?>
    <div id="<?php echo $field; ?>_row" class="nxt-timeline-row">
        <select name='nxt_timeline_options[<?php echo $field; ?>_type]' class='color-type-select' data-field='<?php echo $field; ?>'>
            <option value='color' <?php selected($type, 'color'); ?>>Color</option>
            <option value='css_var' <?php selected($type, 'css_var'); ?>>CSS Variable</option>
        </select>
        <div class='color-input-container' <?php echo $type === 'css_var' ? 'style="display:none;"' : 'style="display: inline-block; vertical-align: top; margin-left: 0.5rem;"'; ?>>
            <input type='text' class='color-picker-input' name='nxt_timeline_options[<?php echo $field; ?>]' value='<?php echo esc_attr($color_value); ?>' data-alpha-enabled="true">
        </div>
        <input type='text' class='css-var-input' name='nxt_timeline_options[<?php echo $field; ?>_css_var]' value='<?php echo esc_attr($css_var_value); ?>' placeholder='var(--color-name)' <?php echo $type === 'color' ? 'style="display:none;"' : 'style="display: inline-block; vertical-align: top; margin-left: 0.5rem;"'; ?>>
    </div>
    <?php
}

#endregion Render functions for each setting

#region Create the options page
function nxt_timeline_options_page() {
    ?>
    <div class="wrap">
        <h1>Animated Timeline Settings</h1>
        <form action='options.php' method='post' enctype="multipart/form-data">
            <?php
            settings_fields('nxt_timeline');
            do_settings_sections('nxt_timeline');
            submit_button();
            ?>
        </form>
    </div>
    <style>
    .nxt-timeline-row.disabled {
        opacity: 0.5;
        pointer-events: none;
    }
    </style>
    <?php
}
#endregion Create the options page

#region File Upload
function nxt_timeline_handle_upload() {
    if (isset($_FILES['custom_svg_upload']) && !empty($_FILES['custom_svg_upload']['tmp_name'])) {
        $upload_dir = wp_upload_dir();
        $file_name = 'custom-timeline-svg-' . time() . '.svg';
        $file_path = $upload_dir['path'] . '/' . $file_name;

        if (move_uploaded_file($_FILES['custom_svg_upload']['tmp_name'], $file_path)) {
            $_POST['nxt_timeline_options']['custom_svg'] = $upload_dir['url'] . '/' . $file_name;
        }
    }
}
add_action('admin_init', 'nxt_timeline_handle_upload');
#endregion File Upload