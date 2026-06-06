import{Q as e}from"./index-CFBk3AzT.js";const n={getAll:a=>e.get("/approvals",{params:a}).then(t=>t.data),getPending:()=>e.get("/approvals/pending").then(a=>a.data),create:a=>e.post("/approvals",a).then(t=>t.data),decide:(a,t)=>e.put(`/approvals/${a}/decide`,t).then(p=>p.data)};export{n as a};
//# sourceMappingURL=approvals-CMWqokF4.js.map
