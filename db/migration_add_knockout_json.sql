-- Tabla existente sin knockout_json: añade la columna (nullable si tu MariaDB no acepta DEFAULT en JSON).
ALTER TABLE bracket_submissions
  ADD COLUMN knockout_json JSON NULL
  AFTER scores_json;

-- Opcional: filas antiguas sin bracket completo (puedes borrarlas o rellenar a mano).
-- UPDATE bracket_submissions SET knockout_json = '{}' WHERE knockout_json IS NULL;
