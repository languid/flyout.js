/**
 * Created by Yinxiong on 2016/1/2.
 */

import $ from 'jquery';
import Flyout from './Flyout';

export default function (anchor, ok = $.noop, html = '') {

	const tpl = `
		<div class="flyout-box flyout-confirm">
			<p class="text"></p>
			<div class="buttons">
				<button role="cancel" class="btn btn-sm btn-secondary">取消</button>
				<button role="ok" class="btn btn-sm btn-primary">确认</button>
			</div>
		</div>`;

	const flyout = new Flyout(tpl, {
		destroy: true,
		events: {
			mounted(){
				this.element.on('click', 'button[role]', e=> {
					let type = $(e.target).attr('role');
					if (type == 'ok') {
						ok.call(this);
					}
					this.hide();
				});
			}
		}
	});

	const text = flyout.element.find('p.text');

	if (html) {
		text.css('width', 'auto').show().html(html);
		if (flyout.element.outerWidth() > 300) {
			text.width('250');
		}
	} else {
		text.hide().html('');
	}

	flyout.show(anchor, 'top', 'center');

	return flyout
}
