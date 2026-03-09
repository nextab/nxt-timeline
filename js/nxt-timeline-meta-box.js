(function (wp) {
	const { registerPlugin } = wp.plugins;
	const { TextControl, PanelBody, PanelRow } = wp.components;
	const { useSelect, useDispatch } = wp.data;
	const { createElement: el } = wp.element;
	const { PluginDocumentSettingPanel } = wp.editor;

	if (!PluginDocumentSettingPanel) {
		return;
	}

	registerPlugin('nxt-timeline-selector', {
		render: function () {
			const metaKey = '_nxt_timeline_selector';

			const value = useSelect(function (select) {
				const meta = select('core/editor').getEditedPostAttribute('meta');
				return (meta && meta[metaKey]) ? meta[metaKey] : '';
			}, []);

			const { editPost } = useDispatch('core/editor');

			function onChange(newValue) {
				editPost({ meta: { [metaKey]: newValue } });
			}

			return el(
				PluginDocumentSettingPanel,
				{
					name: 'nxt-timeline-selector-panel',
					title: 'Timeline Selector',
					icon: 'minus',
				},
				el(PanelRow, null,
					el(TextControl, {
						label: 'CSS Selector (überschreibt globale Einstellung)',
						value: value,
						onChange: onChange,
						placeholder: '.svg-target',
						help: 'Leer lassen um den globalen Selector zu verwenden.',
					})
				)
			);
		},
	});
})(window.wp);
