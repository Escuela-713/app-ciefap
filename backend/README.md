Backend CIEFAP (Django + DRF)

Endpoints
- POST `http://localhost:8000/api/calc/metrics`
  - Body JSON:
    {
      "distance_in_row_m": 6,
      "distance_between_rows_m": 6,
      "trees": [
        {"dap_cm": 28.6, "height_m": 25.9},
        {"dap_cm": 27.5, "height_m": 28.6}
      ]
    }
  - Respuesta: métricas por árbol y agregados por hectárea.

Fórmulas implementadas
- Área basal (AB) por árbol (m2): `pi * (DAP/100)^2 / 4`.
- Volumen total con corteza (m3): `0.0006 + 0.3348 * (DAP/100)^2 * H`.
- Volumen total sin corteza (m3): `-0.0021 + 0.3127 * (DAP/100)^2 * H`.
- Volumen maderable 15 con corteza (m3): `-0.0136 + 0.3247 * (DAP/100)^2 * H`.
- Volumen maderable 15 sin corteza (m3): aproximado usando la razón `(Vol s/c) / (Vol c/c)`.

Agregación por hectárea
- Se usa `Árboles/ha = 10000 / (distancia_en_fila * distancia_entre_filas)`.
- Los valores por hectárea se calculan como `promedio_por_árbol * Árboles/ha`.

Desarrollo
- Entorno virtual: `.venv` (Python).
- Ejecutar: `./.venv/Scripts/python.exe manage.py runserver`.

Conexión MySQL
- Instalar PyMySQL y cryptography: `./.venv/Scripts/python.exe -m pip install PyMySQL cryptography`.
- Variables de entorno soportadas (Windows PowerShell):
- Aplicar migraciones: `./.venv/Scripts/python.exe manage.py migrate`.


Persistencia de resultados (frontend calcula, backend guarda)
- App Django: `api` (label conservada: `ciefap`). Proyecto: `server`.
- Modelo: `Measurement` con `input_data` (JSON) y `metrics` (JSON).
- Endpoints:
  - POST `/api/records` (crea un registro)
    - Body ejemplo:
      {
        "plot_id": 1,
        "input_data": { ... },
        "metrics": { ... }
      }
    - Si `metrics` no se envía, el backend las calcula.
  - GET `/api/records` (lista registros)
  - GET `/api/records/<id>` (detalle de un registro)

