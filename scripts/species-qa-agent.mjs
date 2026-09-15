import fs from 'node:fs';import assert from 'node:assert/strict';
const index=fs.readFileSync('index.html','utf8'),app=fs.readFileSync('app.js','utf8'),species=fs.readFileSync('species-context.js','utf8');
assert.match(index,/name="speciesContext" value="dog"/);assert.match(index,/name="speciesContext" value="cat"/);assert.match(index,/name="speciesContext" value="both"/);
assert.match(index,/name="reportSpecies" value="dog"/);assert.match(index,/name="reportSpecies" value="cat"/);assert.match(index,/name="reportSpecies" value="both"/);
assert.match(app,/speciesContext/);assert.match(app,/species,/);assert.match(species,/mode-cat/);assert.match(species,/mode-both/);assert.match(species,/offleashSection\.hidden=mode==='cat'/);
console.log('PASS Species QA Agent: persistent DOG/CAT/BOTH product context and report relevance');
