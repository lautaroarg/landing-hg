import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';

const endpoint=import.meta.env.VITE_HG_APPS_SCRIPT_URL?.trim()||'';
if(endpoint&&!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint))throw new Error('La URL de Apps Script debe ser una implementación /exec.');
createRoot(document.getElementById('root')!).render(<Home assetBase={import.meta.env.BASE_URL} formEndpoint={endpoint} formMode="apps-script"/>);
