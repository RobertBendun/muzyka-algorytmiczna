function pd(id, setup) {
	new p5(function(p) {
		let animation = null;
		let slot_width = null;
		const to_draw = [];
		const slot_height = 4;
		const slot_spacing = 8;
		const text_size = 14;

		const margin_top = 2;
		const margin_left = 1;

		class PDComment {
			constructor({ msg, x, y }) {
				to_draw.push(this);
				this.msg = msg;
				this.x = x;
				this.y = y;
			}

			draw() {
				p.noStroke();
				p.fill('black');
				p.textAlign(p.LEFT, p.TOP);
				p.textStyle(p.BOLD);
				p.text(this.msg, this.x, this.y + margin_top);
				p.textStyle(p.NORMAL);
			}
		}

		class PDObject {
			constructor({ msg, x, y, inputs, outputs }) {
				to_draw.push(this);
				this.msg = msg;
				this.x = x;
				this.y = y;
				this.inputs = inputs;
				this.outputs = outputs;
				this.input = new Array(inputs);
				this.output = new Array(outputs);
				this.max_slots = Math.max(inputs, outputs);
				this.w = 2 * margin_left + Math.max(
					p.textWidth(msg),
					slot_width * this.max_slots + (this.max_slots - 1) * slot_spacing,
					3 * slot_width);
				this.h = text_size + 2 * margin_top + 2 * slot_height;
				this.actual_spacing_inputs = (this.w - inputs * slot_width) / Math.max(inputs - 1, 1);
				this.actual_spacing_outputs = (this.w - outputs * slot_width) / Math.max(inputs - 1, 1);
			}

			draw() {
				p.stroke('black');
				p.noFill();
				p.rect(this.x, this.y, this.w, this.h);

				p.noStroke();
				p.fill('black');
				p.textAlign(p.LEFT, p.TOP);
				p.text(this.msg, this.x + margin_left, this.y + margin_top + slot_height);


				p.stroke('black');
				for (let i = 0; i < this.inputs; ++i) {
					p.rect(this.x + i * (this.actual_spacing_inputs + slot_width), this.y, slot_width, slot_height);
				}


				p.stroke('black');
				for (let i = 0; i < this.outputs; ++i) {
					p.rect(this.x + i * (this.actual_spacing_outputs + slot_width), this.y + this.h - slot_height, slot_width, slot_height);
				}
			}


			contains(x, y) {
				return x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h;
			}

			eval() {
				switch (this.msg) {
					case '*': {
						const lhs = Number(this.input[0] ?? "0");
						const rhs = Number(this.input[1] ?? "0");
						this.output[0] = lhs * rhs;
						break;
					}

					case 'pipe': {
						this.output[0] = this.input[0];
						break;
					}

					case 'delay':
					case 'bang': {
						this.output[0] = null;
						break;
					}

					case '+ 1':
						this.output[0] = this.input[0] + 1;
						break;

					case 'f':
						if (typeof(this.value) !== typeof(0)) {
							this.value = 0;
						}
						if (this.input[1] !== undefined) {
							this.value = this.input[1];
							this.input[1] = undefined;
						}
						if (typeof(this.input[0]) == typeof(0)) {
							this.value = this.input[0];
							this.input[0] = undefined;
						}
						this.output[0] = this.value;
						break;

					default: {
						throw new Error("unknown object " + this.msg);
					}
				}
			}
		}

		class PDMessage extends PDObject {
			constructor(args) {
				super({ inputs: 1, outputs: 1, ...args});
			}

			draw() {
				p.stroke('black');
				p.noFill();
				p.beginShape();
				p.vertex(this.x, this.y);
				p.vertex(this.x + this.w + slot_width, this.y);
				p.vertex(this.x + this.w, this.y + this.h/5);
				p.vertex(this.x + this.w, this.y + 4 * this.h/5);
				p.vertex(this.x + this.w + slot_width, this.y + this.h);
				p.vertex(this.x, this.y + this.h);
				p.endShape(p.CLOSE);

				p.noStroke();
				p.fill('black');
				p.textAlign(p.LEFT, p.TOP);
				p.text(this.msg, this.x + margin_left, this.y + margin_top + slot_height);

				p.stroke('black');
				p.rect(this.x, this.y, slot_width, slot_height);

				p.stroke('black');
				p.rect(this.x, this.y + this.h - slot_height, slot_width, slot_height);
			}

			eval() {
				this.output[0] = this.msg;
			}
		}

		class PDNumber extends PDMessage {
			constructor(args) {
				super({ msg: "0", inputs: 1, outputs: 1, ...args});
			}

			draw() {
				p.stroke('black');
				p.noFill();
				// rect(this.x, this.y, this.w, this.h);

				p.beginShape();
				p.vertex(this.x, this.y);
				p.vertex(this.x + this.w, this.y);
				p.vertex(this.x + this.w + slot_width, this.y + this.h/5);
				p.vertex(this.x + this.w + slot_width, this.y + this.h);
				p.vertex(this.x, this.y + this.h);
				p.endShape(p.CLOSE);

				p.noStroke();
				p.fill('black');
				p.textAlign(p.LEFT, p.TOP);
				p.text(this.msg, this.x + margin_left, this.y + margin_top + slot_height);

				p.stroke('black');
				p.rect(this.x, this.y, slot_width, slot_height);

				p.stroke('black');
				p.rect(this.x, this.y + this.h - slot_height, slot_width, slot_height);
			}

			eval() {
				this.output[0] = this.input[0] ?? this.msg;
				this.msg = this.output[0];
			}
		}

		class PDControlWire {
			constructor(src, si, dst, di) {
				to_draw.push(this);
				this.src = src;
				this.si = si;
				this.dst = dst;
				this.di = di;
				this.sx = src.x + si * (src.actual_spacing_outputs + slot_width) + slot_width/2;
				this.sy = src.y + src.h;

				this.dx = dst.x + di * (dst.actual_spacing_inputs + slot_width) + slot_width/2;
				this.dy = dst.y;
				this.color = 'black';
			}

			draw() {
				p.stroke(this.color);
				p.line(this.sx, this.sy, this.dx, this.dy);
			}
		}

		class PDSignalWire extends PDControlWire {
			draw() {
				p.strokeWeight(2);
				super.draw();
				p.strokeWeight(1);
			}
		}

		function* send(wire, time) {
			const msg = wire.src.output[wire.si];

			wire.color = 'red';

			for (let t = 0; t < time; t += p.deltaTime) {
				if (msg !== null && msg !== 'bang') {
					p.noStroke();
					const dx = (wire.dx - wire.sx) * t / time;
					const dy = (wire.dy - wire.sy) * t / time;
					p.text(msg, wire.sx + dx, wire.sy + dy);
				}
				yield;
			}

			wire.color = 'black';
			if (msg !== null) {
				wire.dst.input[wire.di] = msg;
			}
			wire.dst.eval();
		}

		function* wait(time=1) {
			for (let t = 0; t < time; t += p.deltaTime) {
				yield;
			}
		}

		function* on_click(box) {
			for (;;) {
				while (!(p.mouseIsPressed && p.mouseButton === p.LEFT && box.contains(p.mouseX, p.mouseY))) yield;

				while (p.mouseIsPressed && p.mouseButton == p.LEFT && box.contains(p.mouseX, p.mouseY)) {
					p.strokeWeight(4);
					box.draw(p);
					p.strokeWeight(1);
					yield;
				}

				if (box.contains(p.mouseX, p.mouseY)) {
					box.eval();
					return;
				}

				yield;
			}
		}

		function* cycle_until_click(box, anim) {
			let state = 'not_pressed';

			while (state !== 'wait_for_finish') {
				for (let x of anim()) {
					yield x;

					switch (state) {
					case 'not_pressed':
						if (p.mouseIsPressed && p.mouseButton === p.LEFT && box.contains(p.mouseX, p.mouseY)) {
							state = 'pressed';
							continue;
						}
						break;

					case 'pressed':
						if (p.mouseIsPressed && p.mouseButton == p.LEFT && box.contains(p.mouseX, p.mouseY)) {
							p.strokeWeight(4);
							box.draw(p);
							p.strokeWeight(1);
							continue;
						} else if (box.contains(p.mouseX, p.mouseY)) {
							state = 'wait_for_finish';
						} else {
							state = 'not_pressed';
						}
						break;
					}
				}
			}
			box.eval();
		}

		function* repeat(times, what) {
			for (let i = 0; i < times; ++i) {
				for (let value of what()) {
					yield value;
				}
			}
		}

		function* cycle(anim) {
			for (;;) {
				for (let x of anim()) yield x;
			}
		}

		function* click(box, time) {
			for (let t = 0; t < time; t += p.deltaTime) {
				p.strokeWeight(4);
				box.draw(p);
				p.strokeWeight(1);
				yield;
			}
			box.eval();
		}

		function* seq(...args) {
			for (let a of args) {
				for (let x of a) {
					yield x;
				}
			}
		}

		function* par(...args) {
			let animations = [...args];
			let done_something;
			do {
				done_something = false;
				for (let i = 0; i < animations.length; ++i) {
					let animation = animations[i];
					if (animation !== null) {
						done_something = true;

						let { value, done } = animation.next();
						if (done) {
							animations[i] = null;
						}
					}
				}
				yield;
			} while (done_something);
		}

		const engine = {
			to_draw,
			PDControlWire, PDSignalWire,
			PDObject, PDMessage, PDNumber,
			PDComment,
			send, cycle, repeat, par, seq, on_click, wait, click, cycle_until_click,
		};

		p.setup = () => {
			const canvas = p.select(id);
			p.createCanvas(canvas.width, canvas.height, canvas.elt);
			p.textSize(text_size);
			p.textFont('monospace');
			slot_width = p.textWidth('*');
			animation = setup(engine);
		};

		p.windowResized = () => {
			const canvas = select(id);
			p.resizeCanvas(canvas.width, canvas.height);
		};

		p.draw = () => {
			p.background('white');
			for (const drawable of engine.to_draw) {
				drawable.draw(p);
			}
			if (animation) {
				const {done} = animation.next();
				if (done) {
					animation = null;
				}
			}
		};
	});
}

pd('#additive', ({
	PDComment, PDMessage, PDObject, PDNumber, PDControlWire, PDSignalWire,
	seq
}) => {
	new PDComment({msg: "Dźwięk MIDI", x: 75, y: 20});
	new PDComment({msg: "Regulacja\ngłośności", x: 75, y: 300});
	new PDComment({msg: "Głośniki", x: 75, y: 340 });

	const input = new PDNumber({msg: 60, x: 25, y: 20});
	const mtof = new PDObject({msg: "mtof", x: 25, y: 70, inputs: 1, outputs: 1});
	const sum = new PDObject({msg: "+~", x: 25, y: 260, inputs: 2, outputs: 1});
	const amp = new PDObject({msg: "*~", x: 25, y: 300, inputs: 2, outputs: 1});
	const dac = new PDObject({msg: "dac~", x: 25, y: 340, inputs: 2, outputs: 0});
	const ampn = new PDNumber({msg: 0.5, x: 75, y: 260});

	const itom  = new PDControlWire(input, 0, mtof, 0);
	const stoa  = new PDSignalWire(sum, 0, amp, 0);
	const atoa  = new PDControlWire(ampn, 0, amp, 1);
	const atodl = new PDSignalWire(amp, 0, dac, 0);
	const atodr = new PDSignalWire(amp, 0, dac, 1);


	const mult = [];
	const osc = [];
	const div = [];

	const hz_to_mult = [];
	const mult_to_osc = [];
	const osc_to_div = [];
	const div_to_sum = [];

	for (let i = 0; i < 4; ++i) {
		const id = 2 * i + 1;
		osc.push(new PDObject({msg: "osc~", x: 25 + i * 50, y: 160, inputs: 2, outputs: 1}));

		if (id !== 1) {
			mult.push(new PDObject({msg: `* ${id}`, x: 25 + i * 50, y: 120, inputs: 2, outputs: 1}));
			hz_to_mult.push(new PDControlWire(mtof, 0, mult[mult.length-1], 0));
		} else {
			hz_to_mult.push(new PDControlWire(mtof, 0, osc[osc.length-1], 0));
		}

		if (id !== 1) {
			div.push(new PDObject({msg: `/~ ${id}`, x: 25 + i * 50, y: 200, inputs: 2, outputs: 1}));
			mult_to_osc.push(new PDControlWire(mult[mult.length-1], 0, osc[osc.length-1], 0));
			osc_to_div.push(new PDSignalWire(osc[osc.length-1], 0, div[div.length-1], 0));
			div_to_sum.push(new PDSignalWire(div[div.length-1], 0, sum, 0));
		} else {
			div_to_sum.push(new PDSignalWire(osc[osc.length-1], 0, sum, 0));
		}
	}

	return seq();
});


pd('#subtractive', ({
	PDComment, PDMessage, PDObject, PDNumber, PDControlWire, PDSignalWire,
	seq
}) => {
	// new PDComment({msg:"Dźwięk wiatru", x: 25, y: 25});
	// {
	// 	const noise = new PDObject({msg: "noise~",   x: 25, y:  60, inputs: 1, outputs: 1})
	// 	const lop1  = new PDObject({msg: "lop~ 300", x: 25, y: 100, inputs: 2, outputs: 1});
	// 	const lop2  = new PDObject({msg: "lop~ 300", x: 25, y: 140, inputs: 2, outputs: 1});
	// 	const dac = new PDObject({msg: "dac", x: 25, y: 180, inputs: 2, outputs: 0});

	// 	const ntol = new PDSignalWire(noise, 0, lop1, 0);
	// 	const ltol = new PDSignalWire(lop1, 0, lop2, 0);
	// 	const ltodl = new PDSignalWire(lop2, 0, dac, 0);
	// 	const ltodr = new PDSignalWire(lop2, 0, dac, 1);
	// }

	new PDComment({msg:"Dźwięki perkusyjne", x: 25, y: 20});
	const noise = new PDObject({msg: "noise~", x: 25, y: 60, inputs: 1, outputs: 1});
	const hip1 = new PDObject({msg: "hip~ 1000", x: 25, y: 100, inputs: 2, outputs: 1});
	const hip2 = new PDObject({msg: "hip~ 1000", x: 25, y: 140, inputs: 2, outputs: 1});
	const amp = new PDObject({msg: "*~", x: 25, y: 200, inputs: 2, outputs: 1});
	const vline = new PDObject({msg: "vline~", x: 100, y: 180, inputs: 3, outputs: 1});
	const dac = new PDObject({msg: "dac~", x: 25, y: 240, inputs: 2, outputs: 0});
	const msg = new PDMessage({msg: "1, 0 200", x: 130, y: 140, inputs: 1, outputs: 1});

	new PDSignalWire(noise, 0, hip1, 0);
	new PDSignalWire(hip1, 0, hip2, 0);
	new PDSignalWire(hip2, 0, amp, 0);
	new PDSignalWire(amp, 0, dac, 0);
	new PDSignalWire(amp, 0, dac, 1);
	new PDSignalWire(vline, 0, amp, 1);
	new PDControlWire(msg, 0, vline, 0);

	return seq();
});

pd("#fm", ({seq, PDNumber, PDObject, PDComment, PDSignalWire, PDControlWire}) => {
	const base = new PDNumber({msg: 100, x: 25, y: 20});
	const mod = new PDObject({msg: "osc~", x: 25, y: 60, inputs: 2, outputs: 1});
	const m24 = new PDObject({msg: "*~ 24", x: 25, y: 100, inputs: 2, outputs: 1});
	const p60 = new PDObject({msg: "+~ 60", x: 25, y: 140, inputs: 2, outputs: 1});
	const mtof = new PDObject({msg: "mtof~", x: 25, y: 180, inputs: 1, outputs: 1});
	const car = new PDObject({msg: "osc~", x: 25, y: 220, inputs: 2, outputs: 1});
	const amp = new PDObject({msg: "* 0.2", x: 25, y: 260, inputs: 2, outputs: 1});
	const dac = new PDObject({msg: "dac~", x: 25, y: 300, inputs: 2, outputs: 0});

	new PDComment({msg: "Modulator", x: 75, y: mod.y});
	new PDComment({msg: "Zakres 2 oktaw", x: 75, y: m24.y});
	new PDComment({msg: "Zaczynamy od :c4", x: 75, y: p60.y});
	new PDComment({msg: "Konwersja do MIDI", x: 75, y: mtof.y});
	new PDComment({msg: "Carrier", x: 75, y: car.y});

	new PDControlWire(base, 0, mod, 0);
	new PDSignalWire(mod, 0, m24, 0);
	new PDSignalWire(m24, 0, p60, 0);
	new PDSignalWire(p60, 0, mtof, 0);
	new PDSignalWire(mtof, 0, car, 0);
	new PDSignalWire(car, 0, amp, 0);
	new PDSignalWire(amp, 0, dac, 0);
	new PDSignalWire(amp, 0, dac, 1);

	return seq();
});

pd("#am", ({seq, PDNumber, PDObject, PDComment, PDSignalWire, PDControlWire}) => {
	const hz = new PDNumber({msg: 100, x: 25, y: 20});
	const base = new PDObject({msg: "osc~", x: 25, y: 60, inputs: 2, outputs: 1});
	const ampm = new PDObject({msg: "*~", x: 25, y: 100, inputs: 2, outputs: 1});
	const ampn = new PDNumber({msg: 100, x: 75, y: 20, inputs: 2, outputs: 1});
	const ampo = new PDObject({msg: "osc~", x: 75, y: 60, inputs: 2, outputs: 1});
	const amp = new PDObject({msg: "*~ 0.2", x: 25, y: 140, inputs: 2, outputs: 1});
	const dac = new PDObject({msg: "dac~", x: 25, y: 180, inputs: 2, outputs: 0});

	new PDControlWire(hz, 0, base, 0);
	new PDControlWire(ampn, 0, ampo, 0);
	new PDSignalWire(base, 0, ampm, 0);
	new PDSignalWire(ampo, 0, ampm, 1);
	new PDSignalWire(ampm, 0, amp, 0);
	new PDSignalWire(amp, 0, dac, 0);
	new PDSignalWire(amp, 0, dac, 1);

	return seq();
});
