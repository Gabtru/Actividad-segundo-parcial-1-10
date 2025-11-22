// Practica_Front-master/static/js/descarga.js

const barra = document.getElementById("barra");
const info = document.getElementById("info");
const img = document.getElementById("img");

document.getElementById("descargar").addEventListener("click", () => {
  barra.value = 0;
  info.textContent = "Iniciando…";
  img.src = "";

  var xhr = new XMLHttpRequest();
  // Usamos una imagen grande de picsum con CORS habilitado
  xhr.open("GET", "https://picsum.photos/2000/1200.jpg", true);
  xhr.responseType = "blob";

  xhr.onprogress = (e) => {
    if (e.lengthComputable) {
      const pct = (e.loaded / e.total) * 100;
      barra.value = pct;
      info.textContent = `Descargado ${e.loaded} / ${e.total} bytes (${pct.toFixed(1)}%)`;
    } else {
      info.textContent = `Descargados ${e.loaded} bytes (tamaño desconocido)…`;
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      const url = URL.createObjectURL(xhr.response);
      img.src = url;
      info.textContent = "Descarga completa.";
      barra.value = 100;
    } else {
      info.textContent = "Error HTTP: " + xhr.status;
    }
  };

  xhr.onerror = () => (info.textContent = "Fallo de red o CORS.");
  xhr.send();
});