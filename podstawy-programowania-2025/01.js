function pd(id, setup) {
	new p5(function(p) {
		let animation = null;
		let slot_width = null;
		const to_draw = [];
		let slot_height = 4;
		let slot_spacing = 8;
		let text_size = 14;

		let margin_top = 2;
		let margin_left = 1;

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
						let lhs = Number(this.input[0] ?? "0");
						let rhs = Number(this.input[1] ?? "0");
						this.output[0] = lhs * rhs;
						console.log(this.msg, lhs, rhs, this.input, this.output);
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

		function* send(wire, time) {
			let msg = wire.src.output[wire.si];

			wire.color = 'red';

			for (let t = 0; t < time; t += p.deltaTime) {
				if (msg !== null) {
					p.noStroke();
					let dx = (wire.dx - wire.sx) * t / time;
					let dy = (wire.dy - wire.sy) * t / time;
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

		let engine = {
			to_draw,
			PDControlWire, PDObject, PDMessage, PDNumber,
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
				const {_, done} = animation.next();
				if (done) {
					animation = null;
				}
			}
		};
	});
}

function _0() {
	to_draw = [];

  let lhs = new PDMessage({msg: "3", x: 50, y: 100});
  let rhs = new PDMessage({msg: "4", x: 100, y: 100});
  let mul = new PDObject({msg: "*", x: 50, y: 200, inputs: 2, outputs: 1});
  let out = new PDNumber({msg: 0, x: 50, y: 300 });

  let w_lhs = new PDControlWire(lhs, 0, mul, 0);
  let w_rhs = new PDControlWire(rhs, 0, mul, 1);
  let w_res = new PDControlWire(mul, 0, out, 0);

  return seq(
    wait(200),
    click(lhs, 300),
    send(w_lhs, 1000),
    send(w_res, 1000),

    click(rhs, 300),
    send(w_rhs, 1000),
    wait(1000),

    click(rhs, 300),
    send(w_rhs, 1000),
    wait(1000),

    click(lhs, 300),
    send(w_lhs, 1000),
    send(w_res, 1000),
    wait(0),
  )
}

function _1() {
	to_draw = [];

  let lhs = new PDMessage({msg: "3", x: 180, y: 100});
  let rhs = new PDMessage({msg: "4", x: 290, y: 110});
  let mul = new PDObject({msg: "*", x: 210, y: 200, inputs: 2, outputs: 1});
  let out = new PDNumber({msg: 0, x: 210, y: 300 });

  let bang = new PDObject({msg:"bang", x:225, y:150, inputs: 1, outputs: 1});

  let w_lhs = new PDControlWire(lhs, 0, mul, 0);
  let w_1_bang = new PDControlWire(rhs, 0, bang, 0);
  let w_2_bang = new PDControlWire(bang, 0, mul, 0);
  let w_rhs = new PDControlWire(rhs, 0, mul, 1);
  let w_res = new PDControlWire(mul, 0, out, 0);

  return seq(
    wait(200),
    click(lhs, 300),
    send(w_lhs, 1000),
    send(w_res, 1000),

    repeat(2, () => seq(
      click(rhs, 300),
      send(w_1_bang, 1000),
      send(w_2_bang, 1000),
      send(w_res, 1000),
      send(w_rhs, 1000),
      wait(1000),
    )),

    click(lhs, 300),
    send(w_lhs, 1000),
    send(w_res, 1000),
    wait(0),
  )
}

pd('#example01', ({
	PDMessage, PDObject, PDNumber, PDControlWire,
	seq, click, cycle, send, cycle_until_click
}) => {
  const lhs = new PDMessage({msg: "3", x: 50, y: 25});
  const rhs = new PDMessage({msg: "4", x: 100, y: 25});
  const mul = new PDObject({msg: "*", x: 50, y: 100, inputs: 2, outputs: 1});
  const out = new PDNumber({msg: 0, x: 50, y: 150 });

  const w1 = new PDControlWire(lhs, 0, mul, 0);
  const w2 = new PDControlWire(rhs, 0, mul, 1);
  const w3 = new PDControlWire(mul, 0, out, 0);

	return cycle(() =>
		seq(
			cycle_until_click(lhs, () => seq(
				click(rhs, 300),
				send(w2, 1000),
			)),
			send(w1, 1000),
			send(w3, 1000),
		)
  );
});

pd('#example02', ({
	PDMessage, PDObject, PDNumber, PDControlWire,
	seq, click, cycle, send, cycle_until_click
}) => {
  const lhs = new PDMessage({msg: "3", x: 50, y: 25});
  const rhs = new PDMessage({msg: "4", x: 100, y: 25});
  const mul = new PDObject({msg: "*", x: 50, y: 100, inputs: 2, outputs: 1});
  const out = new PDNumber({msg: 0, x: 50, y: 150 });

  const w1 = new PDControlWire(lhs, 0, mul, 0);
  const w2 = new PDControlWire(rhs, 0, mul, 1);
  const w3 = new PDControlWire(mul, 0, out, 0);

	return cycle(() =>
		seq(
			cycle_until_click(rhs, () => seq(
				click(lhs, 300),
				send(w1, 1000),
				send(w3, 1000),
			)),
			send(w2, 1000),
		)
  );
});

pd('#example03', ({
	PDMessage, PDObject, PDNumber, PDControlWire,
	seq, on_click, cycle, send
}) => {
  let lhs = new PDMessage({msg: "3", x: 50, y: 25});
  let rhs = new PDMessage({msg: "4", x: 100, y: 75});
  let mul = new PDObject({msg: "*", x: 50, y: 125, inputs: 2, outputs: 1});
  let out = new PDNumber({msg: 0, x: 50, y: 175 });
  let pipe = new PDObject({msg:"pipe", x: 50, y: 75, inputs: 1, outputs: 1});

  let w_lhs1 = new PDControlWire(lhs, 0, pipe, 0);
  let w_pipe = new PDControlWire(pipe, 0, mul, 0);
  let w_lhs2 = new PDControlWire(lhs, 0, rhs, 0);
  let w_rhs = new PDControlWire(rhs, 0, mul, 1);
  let w_res = new PDControlWire(mul, 0, out, 0);

  return seq(
		on_click(lhs),
		cycle(() => seq(
			send(w_lhs1, 1000),
			send(w_lhs2, 1000),
			send(w_rhs, 1000),
			send(w_pipe, 1000),
			send(w_res, 1000),
			on_click(lhs),
		)),
  )
});

pd('#example04', ({
	PDMessage, PDObject, PDNumber, PDControlWire,
	seq, on_click, send, cycle
}) => {
  const lhs   = new PDMessage({msg: "3", x: 50, y: 125});
  const rhs   = new PDMessage({msg: "4", x: 100, y: 25});
  const mul   = new PDObject({msg: "*", x: 75, y: 175, inputs: 2, outputs: 1});
  const out   = new PDNumber({msg: 0, x: 75, y: 225 });
  const delay = new PDObject({msg:"delay", x: 50, y: 75, inputs: 1, outputs: 1});

  const w1 = new PDControlWire(rhs, 0, delay, 0);
  const w2 = new PDControlWire(delay, 0, lhs, 0);
  const w3 = new PDControlWire(lhs, 0, mul, 0);
  const w4 = new PDControlWire(rhs, 0, mul, 1);
  const w5 = new PDControlWire(mul, 0, out, 0);

  return seq(
    on_click(rhs),
		cycle(() => seq(
			send(w1, 1000),
			send(w4, 1000),
			send(w2, 1000),
			send(w3, 1000),
			send(w5, 1000),
			on_click(rhs),
		)),
  );
});
