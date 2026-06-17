class PDA {
  constructor() { this.stack = ["λ"]; }
  reset() { this.stack = ["λ"]; }
  push(x) { this.stack.push(x); }
  pop() { return this.stack.length > 0 ? this.stack.pop() : null; }

  simulate(string) {
    this.reset();
    const trace = [];
    let state = "START", i = 0;

    while (true) {
      trace.push({
        step: trace.length + 1,
        state,
        remaining: i < string.length ? string.slice(i) : "λ",
        stack: [...this.stack],
        symbol: null,
        action: null
      });

      if (state === "START") {
        trace[trace.length-1].action = "ε-transisi → READ1";
        state = "READ1";
      } else if (state === "READ1") {
        if (i >= string.length) {
          const ok = this.stack.length === 1 && this.stack[0] === "λ";
          trace[trace.length-1].action = ok ? "ACCEPT" : `REJECT (input habis, stack: [${this.stack.join(', ')}])`;
          return { accepted: ok, trace, steps: trace.length };
        }
        const s = string[i++];
        trace[trace.length-1].symbol = s;
        if (s === 'a') {
          this.push('a');
          trace[trace.length-1].action = `push 'a' → READ_A`;
          state = "READ_A";
        } else if (s === 'b') {
          this.push('b');
          trace[trace.length-1].action = `push 'b' → READ_B`;
          state = "READ_B";
        } else {
          trace[trace.length-1].action = `REJECT (simbol tidak dikenal: '${s}')`;
          return { accepted: false, trace, steps: trace.length };
        }
      } else if (state === "READ_A") {
        if (i >= string.length) {
          trace[trace.length-1].action = "REJECT (input habis di READ_A)";
          return { accepted: false, trace, steps: trace.length };
        }
        const s = string[i++];
        trace[trace.length-1].symbol = s;
        if (s === 'a') {
          const popped = this.pop();
          if (popped === null) { trace[trace.length-1].action = "REJECT (stack kosong saat pop)"; return { accepted: false, trace, steps: trace.length }; }
          trace[trace.length-1].action = `pop '${popped}' → READ1`;
          state = "READ1";
        } else if (s === 'b') {
          this.push('b');
          trace[trace.length-1].action = `push 'b' → READ_AB`;
          state = "READ_AB";
        } else {
          trace[trace.length-1].action = `REJECT (simbol tidak dikenal: '${s}')`;
          return { accepted: false, trace, steps: trace.length };
        }
      } else if (state === "READ_AB") {
        if (i >= string.length) {
          trace[trace.length-1].action = "REJECT (input habis di READ_AB)";
          return { accepted: false, trace, steps: trace.length };
        }
        const s = string[i++];
        trace[trace.length-1].symbol = s;
        if (s === 'a') {
          const popped = this.pop();
          if (popped === null) { trace[trace.length-1].action = "REJECT (stack kosong saat pop)"; return { accepted: false, trace, steps: trace.length }; }
          trace[trace.length-1].action = `pop '${popped}' → READ_B`;
          state = "READ_B";
        } else if (s === 'b') {
          const popped = this.pop();
          if (popped === null) { trace[trace.length-1].action = "REJECT (stack kosong saat pop)"; return { accepted: false, trace, steps: trace.length }; }
          trace[trace.length-1].action = `pop '${popped}' → READ_A`;
          state = "READ_A";
        } else {
          trace[trace.length-1].action = `REJECT (simbol tidak dikenal: '${s}')`;
          return { accepted: false, trace, steps: trace.length };
        }
      } else if (state === "READ_B") {
        if (i >= string.length) {
          trace[trace.length-1].action = "REJECT (input habis di READ_B)";
          return { accepted: false, trace, steps: trace.length };
        }
        const s = string[i++];
        trace[trace.length-1].symbol = s;
        if (s === 'b') {
          const popped = this.pop();
          if (popped === null) { trace[trace.length-1].action = "REJECT (stack kosong saat pop)"; return { accepted: false, trace, steps: trace.length }; }
          trace[trace.length-1].action = `pop '${popped}' → READ1`;
          state = "READ1";
        } else if (s === 'a') {
          this.push('a');
          trace[trace.length-1].action = `push 'a' → READ_AB`;
          state = "READ_AB";
        } else {
          trace[trace.length-1].action = `REJECT (simbol tidak dikenal: '${s}')`;
          return { accepted: false, trace, steps: trace.length };
        }
      }
    }
  }
}

const pda = new PDA();

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function setAndRun(val) {
  document.getElementById('pda-input').value = val;
  run();
}

function clearAll() {
  document.getElementById('pda-input').value = '';
  document.getElementById('result-badge').style.display = 'none';
  document.getElementById('trace-section').style.display = 'none';
  renderStack(['λ']);
}

function renderStack(stack) {
  const el = document.getElementById('stack-viz');
  el.innerHTML = '';
  stack.forEach((sym) => {
    const cell = document.createElement('div');
    if (sym === 'λ') {
      cell.className = 'stack-cell bottom';
      cell.textContent = 'λ (bottom)';
    } else {
      cell.className = 'stack-cell';
      cell.textContent = sym;
    }
    el.appendChild(cell);
  });
}

function stateClass(state) {
  return '';
}

function run() {
  const val = document.getElementById('pda-input').value;
  const { accepted, trace } = pda.simulate(val);

  // Result badge
  const badge = document.getElementById('result-badge');
  badge.className = accepted ? 'accepted' : 'rejected';
  badge.style.display = 'flex';
  const inputDisplay = val === '' ? '(string kosong / ε)' : `"${esc(val)}"`;
  const lastStep = trace[trace.length - 1];
  const finalStack = lastStep ? lastStep.stack : ['Z'];
  badge.innerHTML = `
    <div class="badge-icon">${accepted ? '✓' : '✗'}</div>
    <div class="badge-text">
      <div>String ${inputDisplay} <strong>${accepted ? 'DITERIMA' : 'DITOLAK'}</strong></div>
      <div class="badge-meta">${trace.length} langkah · stack akhir: [${esc(finalStack.join(', '))}]</div>
    </div>`;

  // Trace table
  const tbody = document.getElementById('trace-body');
  tbody.innerHTML = '';

  trace.forEach((step, idx) => {
    const tr = document.createElement('tr');
    const isLast = idx === trace.length - 1;
    if (isLast) tr.style.background = accepted ? 'rgba(34,197,94,.05)' : 'rgba(239,68,68,.05)';

    const stackItems = step.stack.map((s, i) => {
      const isTop = i === step.stack.length - 1;
      if (isTop && s !== 'λ') {
        return `<span style="font-weight:600;color:#111827">${esc(s)}</span>`;
      }
      if (s === 'λ') {
        return `<span style="color:var(--muted);font-style:italic">λ</span>`;
      }
      return `<span style="color:#374151">${esc(s)}</span>`;
    });
    const stackDisplay = '[' + [...stackItems].reverse().join(', ') + ']';

    let actionHtml = '';
    if (step.action) {
      const a = step.action;
      let color = '#374151';
      if (a.startsWith('ACCEPT')) color = '#166534';
      else if (a.startsWith('REJECT')) color = '#991b1b';
      else if (a.includes('push')) color = '#1d4ed8';
      else if (a.includes('pop') || a.includes('cocok')) color = '#7c3aed';
      else if (a.includes('ε-transisi') || a.includes('tengah')) color = '#92400e';
      actionHtml = `<span style="font-family:monospace;font-size:12px;color:${color}">${esc(a)}</span>`;
    } else {
      actionHtml = '<span style="color:var(--muted)">—</span>';
    }

    tr.innerHTML = `
      <td class="step-num" style="color:var(--muted);font-size:13px">${step.step}</td>
      <td><span class="state-tag ${stateClass(step.state)}">${esc(step.state)}</span></td>
      <td class="mono-text">${esc(step.remaining)}</td>
      <td class="stack-visual" style="font-size:13px">${stackDisplay}</td>
      <td class="mono-text">${step.symbol !== null ? `<span style="padding:2px 8px;border-radius:4px;background:#f3f4f6;font-weight:600">${esc(step.symbol)}</span>` : '<span style="color:var(--muted)">—</span>'}</td>
      <td>${actionHtml}</td>`;
    tbody.appendChild(tr);
  });

  document.getElementById('trace-section').style.display = 'block';

  if (lastStep) {
    renderStack(lastStep.stack);
  }
}

// Enter key
document.getElementById('pda-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') run();
});
