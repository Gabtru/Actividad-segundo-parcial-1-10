
'use strict';
function parsearJSONSeguro(jsonString){
  try{
    return JSON.parse(jsonString);
  }catch(e){
    document.getElementById('mensaje').textContent = 'Error: ' + e.message;
    return null;
  }
}
document.getElementById('btn-parsear').addEventListener('click',()=>{
  document.getElementById('mensaje').textContent = '';
  const txt = document.getElementById('entrada').value;
  const obj = parsearJSONSeguro(txt);
  document.getElementById('out').textContent = obj ? JSON.stringify(obj, null, 2) : '(sin resultado)';
});
document.getElementById('btn-ejemplos').addEventListener('click',()=>{
  document.getElementById('entrada').value = `
{nombre: "Juan"}
{"nombre": "Juan",}
{"edad": undefined}
{"comillas": 'simple'}
`.trim();
});
