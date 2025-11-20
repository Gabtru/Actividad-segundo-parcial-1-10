let xhrActual = null;

document.getElementById("lenta").addEventListener("click", () => {
  const out = document.getElementById("salida");
  out.textContent = "Llamando (timeout 3000ms)…";
  document.getElementById("cancelar").disabled = false;

  var xhr = new XMLHttpRequest();
  xhrActual = xhr;
  // Endpoint que retrasa la respuesta ~5s y permite CORS: httpbin.org/delay/5
  xhr.open("GET", "https://httpbin.org/delay/5", true);
  xhr.timeout = 3000;

  xhr.ontimeout = () => {
    out.textContent = "La solicitud ha superado el tiempo de espera.";
    document.getElementById("cancelar").disabled = true;
  };
  xhr.onerror = () => {
    out.textContent = "Fallo de red o CORS.";
    document.getElementById("cancelar").disabled = true;
  };
  xhr.onload = () => {
    out.textContent = "Completada: " + xhr.status + "\n\n" + xhr.responseText.slice(0,200) + "...";
    document.getElementById("cancelar").disabled = true;
  };
  xhr.send();
});

document.getElementById("cancelar").addEventListener("click", () => {
  if (xhrActual) {
    xhrActual.abort();
    document.getElementById("salida").textContent = "Solicitud cancelada manualmente.";
    document.getElementById("cancelar").disabled = true;
  }
});
