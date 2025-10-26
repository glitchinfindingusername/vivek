/*
	Adapted for Ghibli-Inspired Portfolio
	Original Design: Strata by HTML5 UP (html5up.net | @ajlkn)
	CCA 3.0 license (html5up.net/license)
*/

(function($) {
	"use strict";

	var $window = $(window),
		$body   = $('body'),
		$header = $('#header'),
		$footer = $('#footer'),
		$main   = $('#main'),
		settings = {
			parallax: false // disabled; we use simple animations instead
		};

	// Breakpoints
	breakpoints({
		xlarge:  [ '1281px',  '1800px' ],
		large:   [ '981px',   '1280px' ],
		medium:  [ '737px',   '980px'  ],
		small:   [ '481px',   '736px'  ],
		xsmall:  [ null,      '480px'  ],
	});

	// On load
	$window.on('load', function() {
		window.setTimeout(function() {
			$body.removeClass('is-preload');
			initSite();
		}, 100);
	});

	// Touch/mobile flags
	if (browser.mobile) {
		$body.addClass('is-touch is-mobile');
	}

	// Footer placement
	breakpoints.on('<=medium', function() { $footer.insertAfter($main); });
	breakpoints.on('>medium',  function() { $footer.appendTo('body'); });

	/* =========================
	   Init
	========================= */
	function initSite() {
		if (settings.parallax) $window.off('scroll.strata_parallax');

		setupForm();              // main contact form
		initTypingEffect();       // optional typed heading
		initPhoneRequestModal();  // request number modal
		initEarlyLifeModal();     // NEW: early life modal
	}

	/* =========================
	   Contact form (main)
	========================= */
	function setupForm() {
		const form = $('form[data-form="contact"], #contact form').filter(':not(#phoneRequestForm)').first();
		const msg  = $("#form-message");
		if (!form.length) return;

		form.on("submit", async function(e) {
			e.preventDefault();

			const $submit = form.find('[type="submit"]').first();
			if ($submit.length) $submit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');

			try {
				const res = await fetch(form.attr("action"), {
					method: "POST",
					body: new FormData(form[0]),
					headers: { 'Accept': 'application/json' }
				});

				if (res.ok) {
					form.trigger("reset");
					if (msg.length) {
						msg.css("display", "block");
						if (typeof gsap !== 'undefined') {
							gsap.to(msg, { scale: 1.2, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.inOut" });
						}
					}
					if ($submit.length) {
						$submit.html('<i class="fas fa-check"></i> Sent');
						setTimeout(() => $submit.prop('disabled', false).text('Send Message'), 1200);
					}
				} else {
					throw new Error('Network response not ok');
				}
			} catch (error) {
				console.error('Form submission error:', error);
				if ($submit.length) {
					$submit.html('<i class="fas fa-times"></i> Error');
					setTimeout(() => $submit.prop('disabled', false).text('Send Message'), 1500);
				}
			}
		});
	}

	/* =========================
	   Typing effect
	========================= */
	function initTypingEffect() {
		const typedElement = $(".typed");
		if (!typedElement.length) return;

		const text = typedElement.text();
		typedElement.text("");

		let i = 0;
		const typingInterval = setInterval(() => {
			if (i < text.length) {
				typedElement.text(typedElement.text() + text.charAt(i));
				i++;
			} else {
				clearInterval(typingInterval);
			}
		}, 100);
	}

	/* =========================
	   Request Mobile Number modal
	========================= */
	function initPhoneRequestModal() {
		const $btn    = $('#openPhoneRequest');
		const $modal  = $('#phoneRequestModal');
		const $close  = $('#closePhoneRequest');
		const $form   = $('#phoneRequestForm');
		const $submit = $('#phoneRequestSubmit');

		if (!$btn.length || !$modal.length) return;

		const open = () => {
			$modal.addClass('open').attr('aria-hidden', 'false');
			$body.addClass('modal-open');
			setTimeout(() => $form.find('input[name="name"]').trigger('focus'), 50);
		};
		const close = () => {
			$modal.removeClass('open').attr('aria-hidden', 'true');
			$body.removeClass('modal-open');
		};

		$btn.on('click', open);
		if ($close.length) $close.on('click', close);
		$modal.on('click', (e) => { if (e.target === $modal[0]) close(); });
		$(document).on('keydown', (e) => { if (e.key === 'Escape' && $modal.hasClass('open')) close(); });

		// Submit (with playful re-click lines)
		if ($form.length) {
			let lastAttempt = { name: "", phone: "", reason: "" };
			let repeatClicks = 0;
			const funLines = [
				"The button works. Your fields don’t. 😅",
				"Blank forms don’t call back. Pinky promise.",
				"Try typing. It’s wildly effective.",
				"Pro tip: text goes inside the boxes. ✍️"
			];

			$form.on('submit', async function(e) {
				const name   = $.trim($form.find('[name="name"]').val());
				const phone  = $.trim($form.find('[name="requester_phone"]').val());
				const reason = $.trim($form.find('[name="reason"]').val());

				if (!name || !phone || !reason) {
					e.preventDefault();

					if (lastAttempt.name === name && lastAttempt.phone === phone && lastAttempt.reason === reason) {
						repeatClicks++;
						const msg = funLines[(repeatClicks - 1) % funLines.length];
						if ($submit.length) { $submit.text(msg); setTimeout(() => $submit.text('Submit Request'), 1600); }
					} else {
						repeatClicks = 0;
						if ($submit.length) { $submit.text('Please fill all fields'); setTimeout(() => $submit.text('Submit Request'), 1200); }
					}
					lastAttempt = { name, phone, reason };
					return;
				}

				e.preventDefault();
				repeatClicks = 0;
				if ($submit.length) $submit.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');

				try {
					const res = await fetch($form.attr('action'), {
						method: 'POST',
						body: new FormData($form[0]),
						headers: { 'Accept': 'application/json' }
					});

					if (res.ok) {
						$form[0].reset();
						lastAttempt = { name: "", phone: "", reason: "" };
						if ($submit.length) $submit.html('<i class="fas fa-check"></i> Sent');
						setTimeout(() => { close(); if ($submit.length) $submit.prop('disabled', false).text('Submit Request'); }, 1200);
					} else {
						throw new Error('Network response not ok');
					}
				} catch (err) {
					console.error('Phone request submit error:', err);
					if ($submit.length) {
						$submit.html('<i class="fas fa-times"></i> Error');
						setTimeout(() => { $submit.prop('disabled', false).text('Submit Request'); }, 1500);
					}
				}
			});
		}
	}

	/* =========================
	   Early Life & Leadership modal (NEW)
	========================= */
	function initEarlyLifeModal() {
		const $modal = $('#earlyLifeModal');
		if (!$modal.length) {
			// still make link non-breaking: if there's a trigger but no modal, do nothing special
			return;
		}

		const $openBtn = $('#openEarlyLife'); // optional dedicated trigger
		const $close   = $('#closeEarlyLife');
		const $frame   = $('#elFrame');

		// Also intercept any anchor linking to early-life.html
		$('a[href$="early-life.html"]').on('click', function(e) {
			e.preventDefault();
			open();
		});

		if ($openBtn.length) $openBtn.on('click', open);
		if ($close.length)   $close.on('click', close);

		$modal.on('click', (e) => { if (e.target === $modal[0]) close(); });
		$(document).on('keydown', (e) => { if (e.key === 'Escape' && $modal.hasClass('open')) close(); });

		let loaded = false;
		function open() {
			$modal.addClass('open').attr('aria-hidden','false');
			$body.addClass('modal-open');

			// Lazy-load iframe once
			if (!loaded && $frame.length) {
				const src = $frame.attr('data-src');
				if (src) $frame.attr('src', src);
				loaded = true;
			}
		}
		function close() {
			$modal.removeClass('open').attr('aria-hidden','true');
			$body.removeClass('modal-open');
		}
	}

	// (Gallery/lightbox removed for this design)

})(jQuery);
