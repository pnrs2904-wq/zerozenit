import fs from 'node:fs';
import path from 'node:path';
export interface Product { slug:string; name:string; description:string; category:string; price:number; salePrice:number|null; currency:string; image:string; purchaseUrl:string; downloadUrl:string; featured:boolean; active:boolean; }
export function getProducts(): Product[] { const file=path.join(process.cwd(),'src','data','products.json'); if(!fs.existsSync(file)) return []; try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return []; } }
export function getProduct(slug:string) { return getProducts().find(p=>p.slug===slug); }
