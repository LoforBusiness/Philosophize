// Installs the resolve hook in ./tsresolve.mjs. See that file for why.
import { register } from 'node:module';
register('./tsresolve.mjs', import.meta.url);
