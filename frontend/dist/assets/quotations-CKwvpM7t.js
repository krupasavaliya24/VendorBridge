import{Q as e}from"./index-CFBk3AzT.js";const n={getAll:t=>e.get("/quotations",{params:t}).then(a=>a.data),getById:t=>e.get(`/quotations/${t}`).then(a=>a.data),create:t=>e.post("/quotations",t).then(a=>a.data),compare:t=>e.get(`/quotations/compare/${t}`).then(a=>a.data),select:t=>e.post(`/quotations/${t}/select`).then(a=>a.data)};export{n as q};
//# sourceMappingURL=quotations-CKwvpM7t.js.map
