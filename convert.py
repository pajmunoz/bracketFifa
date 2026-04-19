from pathlib import Path
from PIL import Image

# PNG sueltos aquí → salida en webp/ (el hero solo carga .webp).
input_dir = Path("public/welcome_video")
output_dir = input_dir / "webp"

output_dir.mkdir(exist_ok=True)

for file_path in input_dir.iterdir():
    if file_path.is_dir():
        continue
    if file_path.suffix.lower() == ".png":
        output_path = output_dir / f"{file_path.stem}.webp"

        with Image.open(file_path) as img:
            img.save(output_path, "WEBP", quality=85)

        print(f"Convertido: {file_path.name} -> {output_path.name}")

print("Proceso terminado")