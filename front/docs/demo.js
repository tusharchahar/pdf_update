function make_pdfform() {
	var lib_name = 'pdfjs';
	return pdfform(minipdf_js);
}

// Create form
function list(buf) {
	var list_form = document.querySelector('.list_form');
	empty(list_form);
	var blob = new Blob([buf], {type: 'application/pdf'});
	console.log(blob);
	var link =URL.createObjectURL(blob);
	document.querySelector('.pdf_frame object').setAttribute('data',link);

	var cnt = 1;
	var field_specs;
	try {
		field_specs = make_pdfform().list_fields(buf);
	} catch (e) {
		on_error(e);
		return;
	}
	for (var field_key in field_specs) {
		var row = document.createElement('div');
		row.appendChild(document.createTextNode(field_key));
		list_form.appendChild(row);
		field_specs[field_key].forEach(function(spec, i) {
			if ((spec.type === 'radio') && spec.options) {
				var fieldset_el = document.createElement('fieldset');
				spec.options.forEach(function(ostr) {
					var label = document.createElement('label');
					var radio = document.createElement('input');
					radio.setAttribute('type', 'radio');
					radio.setAttribute('value', ostr);
					radio.setAttribute('name', field_key + '_' + i);
					radio.setAttribute('data-idx', i);
					radio.setAttribute('data-key', field_key);
					label.appendChild(radio);
					label.appendChild(document.createTextNode(ostr));
					fieldset_el.appendChild(label);
				});
				row.appendChild(fieldset_el);
				return;
			}

			var input = document.createElement((spec.type === 'select') ? 'select' : 'input');
			input.setAttribute('data-idx', i);
			input.setAttribute('data-key', field_key);
			if (spec.type === 'boolean') {
				input.setAttribute('type', 'checkbox');
			} else if (spec.type === 'string') {
				input.setAttribute('value', cnt++);
			} else if ((spec.type === 'select') && spec.options) {
				spec.options.forEach(function(ostr) {
					var option_el = document.createElement('option');
					option_el.appendChild(document.createTextNode(ostr));
					option_el.setAttribute('value', ostr);
					input.appendChild(option_el);
				});
			}
			row.appendChild(input);
		});
	}
}

// Sending Post request of updated fields
function fill(buf) {
	var list_form = document.querySelector('.list_form');
	var fields = {};
	list_form.querySelectorAll('input,select').forEach(function(input) {
		if ((input.getAttribute('type') === 'radio') && !input.checked) {
			return;
		}

		var key = input.getAttribute('data-key');
		if (!fields[key]) {
			fields[key] = [];
		}
		var index = parseInt(input.getAttribute('data-idx'), 10);
		var value = (input.getAttribute('type') === 'checkbox') ? input.checked : input.value;
		fields[key][index] = value;
	});
	console.log(fields);
	fetch('http://localhost:3000/pdf', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(fields)
  }).catch((err)=>{
	throw new Error(`post request failed${err}`);
  })
}

function on_error(e) {
	console.error(e, e.stack);  // eslint-disable-line no-console
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(e.message));
	document.querySelector('.error').appendChild(div);
}

function empty(node) {
	var last;
	while ((last = node.lastChild)) {
		node.removeChild(last);
	}
}

var current_buffer;

function on_file(buf) {
	current_buffer = buf;
	document.querySelector('.url_form').setAttribute('style', 'display: none');
	var cur_file = document.querySelector('.cur_file');
	empty(cur_file);
	cur_file.setAttribute('style', 'display: block');
	var reload_btn = document.createElement('button');
	reload_btn.appendChild(document.createTextNode('Load PDF'));
	cur_file.appendChild(reload_btn);
	document.querySelector('.fill').removeAttribute('disabled');

	list(current_buffer);
}

document.addEventListener('DOMContentLoaded', function() {
	// Download by URL
	// Note that this just works for URLs in the same origin, see Same-Origin Policy
	var url_form = document.querySelector('.url_form');
	url_form.addEventListener('submit', function(e) {
		e.preventDefault();
		var url = 'http://localhost:3000/pdf';

		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function() {
			if (this.status == 200) {
				on_file(this.response);
			} else {
				on_error('failed to load URL (code: ' + this.status + ')');
			}
		};

		xhr.send();
	});

	var fill_form = document.querySelector('.update_pdf');
	fill_form.addEventListener('submit', function(e) {
		e.preventDefault();
		fill(current_buffer);
	});

	document.querySelector('.loading').setAttribute('style', 'display: none');
});
