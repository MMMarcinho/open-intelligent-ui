import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
import { compileDslToWidget } from '../packages/muse-app-adapter/index.js';

function mount(dsl: string, hostData: Record<string, unknown> = {}) {
  const result = compileDslToWidget(dsl, { hostData });
  let state: Record<string, unknown> | undefined;
  const errors: Error[] = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error));
  const dom = new JSDOM(result.html, {
    runScripts: 'dangerously', virtualConsole,
    beforeParse(window) {
      Object.assign(window, { hatchWidget: {
        getState(defaults: Record<string, unknown>) { return state ??= { ...defaults }; },
        setState(next: Record<string, unknown>) {
          state = { ...next };
          window.dispatchEvent(new window.Event('hatch-widget-state'));
        },
      } });
    },
  });
  assert.deepEqual(errors, [], 'generated runtime must execute without errors');
  return { ...result, dom, document: dom.window.document, state: () => state! };
}

test('generated runtime preserves text, custom setters and boolean state across repeated clicks', () => {
  const widget = mount(`{@body const [city,chooseCity]=DIL.useState("Old Town")}
{@body const [count,setValue]=DIL.useState(0)}
{@body const [enabled,setEnabled]=DIL.useState(false)}
{@body const doubled=count*2}
<text>{city} / {doubled} / {enabled}</text>
<button onClick={() => chooseCity("New York")}>city</button>
<button onClick={() => chooseCity("O'Reilly")}>name</button>
<button onClick={() => setValue(previous => previous + 1)}>increment</button>
<button onClick={() => setEnabled(true)}>enable</button>`);
  assert.deepEqual(widget.warnings, []);
  assert.equal(widget.state().enabled, false);
  const buttons = widget.document.querySelectorAll('button');
  buttons[0].click(); assert.equal(widget.state().city, 'New York');
  buttons[1].click(); assert.equal(widget.state().city, "O'Reilly");
  buttons[2].click(); buttons[2].click(); buttons[3].click();
  assert.deepEqual(widget.state(), { city: "O'Reilly", count: 2, enabled: true });
  assert.match(widget.document.querySelector('.tui-text')!.textContent!, /O'Reilly \/ 4 \/ true/);
  assert.equal(buttons[1].classList.contains('on'), true);
  widget.dom.window.close();
});

test('script-like text in host data, defaults and derived declarations remains data', () => {
  const text = '</script><script>window.unexpected = true</script><!-- < & >\u2028\u2029';
  const widget = mount(`{@body const [label,setLabel]=DIL.useState(${JSON.stringify(text)})}
{@body const derived=${JSON.stringify(text)}}
<text>{label}{derived}{HOST}</text>`, { HOST: text });
  assert.equal(widget.document.querySelectorAll('script').length, 1);
  assert.equal((widget.dom.window as unknown as Record<string, unknown>).unexpected, undefined);
  assert.equal(widget.document.querySelector('.tui-text')!.textContent, text.repeat(3));
  widget.dom.window.close();
});

test('select and slider use declared onChange targets, respect disabled and literal numeric props', () => {
  const widget = mount(`{@body const [shown,setShown]=DIL.useState("a")}
{@body const [chosen,choose]=DIL.useState("a")}
{@body const [amount,adjust]=DIL.useState(2)}
<select value={shown} onChange={choose} options={OPTIONS}/>
<slider value={amount} onChange={v => adjust(v)} min="0" max="10" step="2" disabled={false}/>
<slider value={amount} onChange={adjust} min={0} max={10} disabled={true}/>
<select value={shown} onChange={unknown} options={OPTIONS}/>`, {
    OPTIONS: [{ value: 'a', label: 'A' }, { value: "O'Reilly", label: "O'Reilly" }],
  });
  const select = widget.document.querySelector('select')!;
  select.value = "O'Reilly";
  select.dispatchEvent(new widget.dom.window.Event('change'));
  assert.equal(widget.state().chosen, "O'Reilly");
  assert.equal(widget.state().shown, 'a');
  const sliders = widget.document.querySelectorAll('input');
  assert.equal(sliders[0].max, '10'); assert.equal(sliders[0].step, '2');
  sliders[0].value = '6'; sliders[0].dispatchEvent(new widget.dom.window.Event('input'));
  assert.equal(widget.state().amount, 6);
  sliders[1].value = '8'; sliders[1].dispatchEvent(new widget.dom.window.Event('input'));
  assert.equal(widget.state().amount, 6);
  assert.equal(widget.document.querySelectorAll('select')[1].disabled, true);
  assert.ok(widget.warnings.some(w => w.includes('onChange')));
  widget.dom.window.close();
});

test('unsupported handlers cannot silently mutate guessed state keys', () => {
  for (const handler of ['()=>setMissing(1)', '()=>setValue(prev=>previous+1)', '()=>setValue(1,2)', '()=>setValue(fetch("/"))']) {
    const widget = mount(`{@body const [count,setValue]=DIL.useState(0)}<button onClick={${handler}}>go</button>`);
    assert.equal(widget.document.querySelector('button')!.disabled, true);
    widget.document.querySelector('button')!.click();
    assert.deepEqual(widget.state(), { count: 0 });
    widget.dom.window.close();
  }
});


test('calculator example renders totals and repaints from host state', () => {
  const dsl = readFileSync(new URL('../packages/muse-app-adapter/examples/token-calculator.dsl.txt', import.meta.url), 'utf8');
  const widget = mount(dsl, {
    PRICES: { 'gpt6-sol': { input: 2, output: 10 } }, FX: 6.69,
    MODEL_OPTIONS: [{ value: 'gpt6-sol', label: 'Test model' }],
  });
  assert.deepEqual(widget.warnings, []);
  assert.equal(widget.document.querySelector('.x-gval')!.textContent, '$0.15');
  widget.document.querySelectorAll('button')[1].click();
  assert.equal(widget.document.querySelector('.x-gval')!.textContent, '$0.25');
  const bridge = (widget.dom.window as unknown as { hatchWidget: { setState(s: Record<string, unknown>): void } }).hatchWidget;
  bridge.setState({ model: 'gpt6-sol', inK: 500, outK: 100 });
  assert.equal(widget.document.querySelector('.x-gval')!.textContent, '$2.00');
  assert.equal(widget.document.querySelector('input')!.value, '500');
  widget.dom.window.close();
});
