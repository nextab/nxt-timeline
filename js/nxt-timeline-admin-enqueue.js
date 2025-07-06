(function() {
	'use strict';

	document.addEventListener('DOMContentLoaded', function() {
		const manualEnqueueCheckbox = document.getElementById('manual_enqueue_enabled');
		const manualEnqueueOptions = document.querySelectorAll('.manual-enqueue-option');
		
		function toggleManualEnqueueOptions() {
			const isEnabled = manualEnqueueCheckbox.checked;
			manualEnqueueOptions.forEach(function(option) {
				if (isEnabled) {
					option.classList.add('enabled');
				} else {
					option.classList.remove('enabled');
				}
			});
		}
		
		if (manualEnqueueCheckbox) {
			manualEnqueueCheckbox.addEventListener('change', toggleManualEnqueueOptions);
			toggleManualEnqueueOptions(); // Initial state
		}
		
		// Posts selector
		const selectPostsButton = document.getElementById('select_posts_button');
		const postsSelector = document.getElementById('posts_selector');
		const specificPostsInput = document.querySelector('input[name="nxt_timeline_options[enqueue_specific_posts]"]');
		
		if (selectPostsButton && postsSelector && specificPostsInput) {
			selectPostsButton.addEventListener('click', function() {
				if (postsSelector.style.display === 'none') {
					loadPosts();
					postsSelector.style.display = 'block';
					this.textContent = 'Hide Posts';
				} else {
					postsSelector.style.display = 'none';
					this.textContent = 'Select Posts';
				}
			});
		}
		
		// Pages selector
		const selectPagesButton = document.getElementById('select_pages_button');
		const pagesSelector = document.getElementById('pages_selector');
		const specificPagesInput = document.querySelector('input[name="nxt_timeline_options[enqueue_specific_pages]"]');
		
		if (selectPagesButton && pagesSelector && specificPagesInput) {
			selectPagesButton.addEventListener('click', function() {
				if (pagesSelector.style.display === 'none') {
					loadPages();
					pagesSelector.style.display = 'block';
					this.textContent = 'Hide Pages';
				} else {
					pagesSelector.style.display = 'none';
					this.textContent = 'Select Pages';
				}
			});
		}
		
		function loadPosts() {
			if (postsSelector.children.length > 0) return; // Already loaded
			
			postsSelector.innerHTML = '<p>Loading posts...</p>';
			
			fetch(nxtTimelineAdmin.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: 'action=nxt_timeline_get_posts&nonce=' + nxtTimelineAdmin.nonce
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					const currentIds = specificPostsInput.value.split(',').map(id => id.trim()).filter(id => id);
					let html = '';
					
					data.data.forEach(function(post) {
						const checked = currentIds.includes(post.id.toString()) ? 'checked' : '';
						html += '<label><input type="checkbox" value="' + post.id + '" ' + checked + '> ' + post.title + ' (ID: ' + post.id + ')</label>';
					});
					
					postsSelector.innerHTML = html;
					
					// Add event listeners to checkboxes
					postsSelector.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
						checkbox.addEventListener('change', function() {
							updatePostsInput();
						});
					});
				} else {
					postsSelector.innerHTML = '<p>Error loading posts</p>';
				}
			})
			.catch(error => {
				postsSelector.innerHTML = '<p>Error loading posts</p>';
			});
		}
		
		function loadPages() {
			if (pagesSelector.children.length > 0) return; // Already loaded
			
			pagesSelector.innerHTML = '<p>Loading pages...</p>';
			
			fetch(nxtTimelineAdmin.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: 'action=nxt_timeline_get_pages&nonce=' + nxtTimelineAdmin.nonce
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					const currentIds = specificPagesInput.value.split(',').map(id => id.trim()).filter(id => id);
					let html = '';
					
					data.data.forEach(function(page) {
						const checked = currentIds.includes(page.id.toString()) ? 'checked' : '';
						html += '<label><input type="checkbox" value="' + page.id + '" ' + checked + '> ' + page.title + ' (ID: ' + page.id + ')</label>';
					});
					
					pagesSelector.innerHTML = html;
					
					// Add event listeners to checkboxes
					pagesSelector.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
						checkbox.addEventListener('change', function() {
							updatePagesInput();
						});
					});
				} else {
					pagesSelector.innerHTML = '<p>Error loading pages</p>';
				}
			})
			.catch(error => {
				pagesSelector.innerHTML = '<p>Error loading pages</p>';
			});
		}
		
		function updatePostsInput() {
			const checkedBoxes = postsSelector.querySelectorAll('input[type="checkbox"]:checked');
			const ids = Array.from(checkedBoxes).map(cb => cb.value);
			specificPostsInput.value = ids.join(',');
		}
		
		function updatePagesInput() {
			const checkedBoxes = pagesSelector.querySelectorAll('input[type="checkbox"]:checked');
			const ids = Array.from(checkedBoxes).map(cb => cb.value);
			specificPagesInput.value = ids.join(',');
		}
	});
})(); 