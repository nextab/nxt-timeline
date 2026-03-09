<?php
/*
Plugin Name: Animated Timeline
Description: Creates an animated timeline with SVG and JavaScript
Version: 1.2
Author: nexTab & Unleashed Design
Author URI: https://nextab.de
Text Domain: nxt-timeline
*/

#region Enqueue Scripts in frontend
function nxt_timeline_enqueue_scripts() {
    global $post;
    
    if (nxt_timeline_should_enqueue()) {
        wp_register_script('nxt-timeline', plugin_dir_url(__FILE__) . 'js/nxt-timeline.js', false, filemtime(plugin_dir_path(__FILE__) . 'js/nxt-timeline.js'), true);
        
        $options = get_option('nxt_timeline_options');
        if (!empty($options['custom_svg_id'])) {
            $options['custom_svg_url'] = wp_get_attachment_url($options['custom_svg_id']);
        }

        // Per-page selector override
        if ($post) {
            $page_selector = get_post_meta($post->ID, '_nxt_timeline_selector', true);
            if (!empty($page_selector)) {
                $options['target_selector'] = $page_selector;
            }
        }

        wp_localize_script('nxt-timeline', 'nxtTimelineOptions', $options);
        wp_enqueue_script('nxt-timeline');
    }
}
add_action('wp_enqueue_scripts', 'nxt_timeline_enqueue_scripts', 999999);

function nxt_timeline_should_enqueue() {
    global $post;
    $options = get_option('nxt_timeline_options');
    
    // Check manual enqueue settings first
    if (!empty($options['manual_enqueue_enabled'])) {
        // Check for all posts
        if (!empty($options['enqueue_all_posts']) && is_single()) {
            return true;
        }
        
        // Check for all pages
        if (!empty($options['enqueue_all_pages']) && is_page()) {
            return true;
        }
        
        // Check for all archives
        if (!empty($options['enqueue_all_archives']) && is_archive()) {
            return true;
        }
        
        // Check for specific posts
        if (!empty($options['enqueue_specific_posts']) && is_single()) {
            $specific_posts = array_map('intval', array_map('trim', explode(',', $options['enqueue_specific_posts'])));
            if (in_array($post->ID, $specific_posts, true)) {
                return true;
            }
        }
        
        // Check for specific pages
        if (!empty($options['enqueue_specific_pages']) && is_page()) {
            $specific_pages = array_map('intval', array_map('trim', explode(',', $options['enqueue_specific_pages'])));
            if (in_array($post->ID, $specific_pages, true)) {
                return true;
            }
        }
        
        // If manual enqueue is enabled but no conditions match, don't enqueue
        return false;
    }
    
    // Fall back to original content-based detection
    if (!$post) return false;
    $target_selector = isset($options['target_selector']) ? $options['target_selector'] : '.svg-target';
    // Extract class name from selector for content detection (remove dots, spaces, etc.)
    $target_class = preg_replace('/[^a-zA-Z0-9_-]/', '', $target_selector);
    // Also check for old target_class for backward compatibility
    if (empty($target_class) && isset($options['target_class'])) {
        $target_class = $options['target_class'];
    }
    if (empty($target_class)) {
        $target_class = 'svg-target';
    }
    return (strpos($post->post_content, $target_class) !== false);
}
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

    // Enqueue admin CSS
    wp_enqueue_style(
        'nxt-timeline-admin-css',
        $plugin_url . 'css/nxt-timeline-admin.css',
        array(),
        filemtime($plugin_dir . 'css/nxt-timeline-admin.css')
    );

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

    // Enqueue admin enqueue script
    wp_enqueue_script(
        'nxt-timeline-admin-enqueue',
        $plugin_url . 'js/nxt-timeline-admin-enqueue.js',
        array(),
        filemtime($plugin_dir . 'js/nxt-timeline-admin-enqueue.js'),
        true
    );

    // Localize script for AJAX
    wp_localize_script('nxt-timeline-admin-enqueue', 'nxtTimelineAdmin', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('nxt_timeline_nonce')
    ));
}
add_action('admin_enqueue_scripts', 'nxt_timeline_enqueue_admin_scripts');
#endregion Enqueue Scripts in WP backend

// Include admin page functionality
if (is_admin()) {
    require_once plugin_dir_path(__FILE__) . 'includes/admin-page.php';
}

#region Per-page selector meta field
function nxt_timeline_register_meta() {
    register_post_meta('', '_nxt_timeline_selector', [
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function() {
            return current_user_can('edit_posts');
        },
        'sanitize_callback' => 'sanitize_text_field',
    ]);
}
add_action('init', 'nxt_timeline_register_meta');

function nxt_timeline_enqueue_block_editor_assets() {
    wp_enqueue_script(
        'nxt-timeline-meta-box',
        plugin_dir_url(__FILE__) . 'js/nxt-timeline-meta-box.js',
        ['wp-plugins', 'wp-edit-post', 'wp-editor', 'wp-components', 'wp-data', 'wp-element'],
        filemtime(plugin_dir_path(__FILE__) . 'js/nxt-timeline-meta-box.js'),
        true
    );
}
add_action('enqueue_block_editor_assets', 'nxt_timeline_enqueue_block_editor_assets');
#endregion Per-page selector meta field