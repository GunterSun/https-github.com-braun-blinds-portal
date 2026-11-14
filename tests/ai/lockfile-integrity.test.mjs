import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
test('dependency lockfile is complete and matches the package manifest',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 assert.equal(lock.name,pkg.name);
 assert.equal(lock.lockfileVersion,3);
 assert.deepEqual(lock.packages[''].dependencies,pkg.dependencies);
 assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
 assert.ok(Object.keys(lock.packages).length>100,'lockfile unexpectedly truncated');
});
