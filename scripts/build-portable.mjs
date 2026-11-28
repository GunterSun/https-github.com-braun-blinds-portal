import {spawnSync} from 'node:child_process';
const run=(command,args)=>{const r=spawnSync(command,args,{stdio:'inherit',timeout:180000});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);};
run(process.execPath,['scripts/check-complete-source.mjs']);
if(process.platform==='linux')run('bash',['scripts/build-verified.sh']);
else {
 run(process.execPath,['scripts/check-locales.mjs']);
 run(process.execPath,['scripts/check-z-series-catalog.mjs']);
 run(process.execPath,['node_modules/vinext/dist/cli.js','build']);
 run(process.execPath,['scripts/validate-worker-artifact.mjs','dist/server/index.js','dist/.openai/hosting.json']);
}
