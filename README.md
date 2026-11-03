# Reinos de Éter

Juego de estrategia por turnos con héroes, castillos y combates tácticos por hexágonos, inspirado en los clásicos del género
(mecánicas basadas en las reglas conocidas de *Heroes of Might and Magic III*: puntos de movimiento por velocidad de la criatura
más lenta, costes de terreno, fórmula de daño con ataque/defensa, moral y suerte, tabla de experiencia, etc.).
Todo el contenido (castillos, criaturas, hechizos, héroes y escenarios) es original y los gráficos se generan por código.

## Cómo jugar
Abre `index.html` en el navegador (doble clic) o, desde esta carpeta:

    python3 -m http.server 8790   # y abre http://localhost:8790

## Contenido
- **200 escenarios gigantes de 2 niveles** (superficie y subterráneo, de 144×144 a 180×180 casillas cada uno), con 10 biomas, lagos de lava, cordilleras y, en algunos mapas, mar con islas y barcos.
- **Siempre 8 jugadores**: tú (con el color y la facción que elijas) y 7 rivales de IA.
- **8 castillos nuevos**: Ciudadela del Alba, Bosque Umbrío, Cripta Sepulcral, Fortaleza Brasa, Baluarte Pétreo, Cala Marea, Ciénaga Venenosa y Cumbres Tormenta.
- **126 criaturas** (7 niveles × 2 versiones por castillo + 14 neutrales), 17 hechizos de combate con escuelas de magia, **más de 140 artefactos** en 14 ranuras de equipo y 11 conjuntos, **25 habilidades secundarias** (Diplomacia, Logística, Orientación, Navegación, Nigromancia, Liderazgo, Suerte, Aprendizaje, Medicina, Tácticas, Resistencia, Ojo de Águila, Hechicería, 4 escuelas de magia...), especialidades de héroe y 96 héroes.
- Puertas subterráneas, monolitos bidireccionales y unidireccionales, astilleros (en ciudades junto al agua), barcos, mercaderes de artefactos, santuarios, cabañas de brujas y más.
- Mapa de aventura con niebla de guerra, caminos, minas de 7 recursos, viviendas, santuarios, artefactos, cofres y monstruos con zona de control.
- Ciudades con 26 edificios, reclutamiento semanal, mejora de criaturas, gremio de magos, taberna y mercado.
- Combate por hexágonos con tiradores, voladores, ataque doble, aliento, regeneración, drenaje de vida, moral, suerte, huida y rendición.
- IA que simula combates antes de atacar, evita zonas peligrosas, defiende sus ciudades, comercia, mejora tropas y contrata héroes.

## Controles
- Clic en el mapa: ver ruta · segundo clic: caminar · clic derecho: información.
- Cámara: flechas / WASD / borde de pantalla / minimapa.
- `E` fin de turno · `Espacio` siguiente héroe · `H` ficha del héroe · `T` ciudad · `Esc` menú.
- Combate: `W` esperar · `D` defender · `S` hechizos · `A` automático.

## Novedades (v3)
- **Mapas ~10× más grandes** (≈450–570 casillas de lado × 2 niveles), con más de 200 castillos neutrales abandonados, protegidos por criaturas, que se pueden conquistar.
- **Asedios**: murallas de nivel 1–3 según el Fuerte/Ciudadela/Castillo, puerta, torres de arqueros y catapulta con turno propio. Voladores y criaturas que se teletransportan atraviesan el muro. El **combate rápido** (Sistema → Combate rápido) simula todo esto.
- **Campeones únicos**: 20 por castillo, 2500 de oro, cambian cada semana, 2 habilidades (nivel 1–3) y tropas de nivel 1–2.
- **Semanas especiales** (criatura ×2 + manadas nuevas con aro verde en el mapa, o plaga) y crecimiento semanal de manadas.
- **Barcos**: subir o bajar agota los pasos del día. La IA construye astilleros, navega y explora islas.
- **Artefactos ×2 (308)** y **fusión de linajes** (arma+escudo+yelmo+anillo → reliquia que bloquea 4 ranuras).
- **30 sitios nuevos** (arenas, escuelas, fuentes, tesoros custodiados, observatorios, faros…).
- Guardado por diferencias (mapas gigantes).
