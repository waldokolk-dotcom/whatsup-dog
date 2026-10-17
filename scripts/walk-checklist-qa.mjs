import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const script = readFileSync('walk-checklist.js', 'utf8');
const data = new Map();
class Element {
  constructor(tag) { this.tagName=tag; this.children=[]; this.listeners={}; this.style={}; this.checked=false; this.textContent=''; this.value=''; }
  append(...elements) { this.children.push(...elements); }
  setAttribute(name,value) { this[name]=value; }
  addEventListener(name,handler) { this.listeners[name]=handler; }
  querySelector() { return null; }
  querySelectorAll(selector) {
    const results=[];
    const walk=parent=>parent.children.forEach(child=>{
      if(child.tagName==='input' && child.type==='checkbox' && (!selector.endsWith(':checked') || child.checked)) results.push(child);
      walk(child);
    });
    walk(this); return results;
  }
}
function render() {
  const home=new Element('section');
  const document={
    readyState:'complete',
    querySelector:selector=>selector==='#view-home'?home:null,
    createElement:tag=>new Element(tag)
  };
  const localStorage={
    getItem:key=>data.get(key)??null,
    setItem:(key,value)=>data.set(key,value),
    removeItem:key=>data.delete(key)
  };
  vm.runInNewContext(script,{document,localStorage,fetch:()=>{throw new Error('Network must not be used')}});
  const section=home.children[0];
  assert.equal(section.id,'wd-walk-checklist');
  const boxes=section.querySelectorAll('input[type=checkbox]');
  const progress=section.children.find(x=>x.id==='wd-walk-progress');
  const reset=section.children.find(x=>x.tagName==='button');
  return {boxes,progress,reset};
}
let view=render();
assert.equal(view.boxes.length,3);
assert.equal(view.progress.textContent,'0 van 3 klaar');
view.boxes[0].checked=true; view.boxes[0].listeners.change();
assert.equal(view.progress.textContent,'1 van 3 klaar');
view=render();
assert.equal(view.boxes[0].checked,true,'Checklist must survive a page reload');
for(const box of view.boxes){box.checked=true;box.listeners.change();}
assert.match(view.progress.textContent,/Helemaal klaar!/);
assert.equal(view.progress['aria-live'],'polite');
view.reset.listeners.click();
assert.equal(view.progress.textContent,'0 van 3 klaar');
assert.equal(data.has('wd_walk_checklist_v1'),false);
console.log('PASS: private checklist progress, persistence, accessibility and reset');
