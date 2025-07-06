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
    
    // Check if we should enqueue based on manual settings
    if (nxt_timeline_should_enqueue()) {
        wp_register_script('nxt-timeline', plugin_dir_url(__FILE__) . 'js/nxt-timeline.js', false, '1.0', true);
        
        $options = get_option('nxt_timeline_options');
        // Ensure custom_svg_url is included in the options
        if (!empty($options['custom_svg_id'])) {
            $options['custom_svg_url'] = wp_get_attachment_url($options['custom_svg_id']);
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
            $specific_posts = array_map('trim', explode(',', $options['enqueue_specific_posts']));
            if (in_array($post->ID, $specific_posts)) {
                return true;
            }
        }
        
        // Check for specific pages
        if (!empty($options['enqueue_specific_pages']) && is_page()) {
            $specific_pages = array_map('trim', explode(',', $options['enqueue_specific_pages']));
            if (in_array($post->ID, $specific_pages)) {
                return true;
            }
        }
        
        // If manual enqueue is enabled but no conditions match, don't enqueue
        return false;
    }
    
    // Fall back to original content-based detection
    if (!$post) return false;
    return (strpos($post->post_content, 'svg-target') !== false);
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