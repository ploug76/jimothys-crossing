# Jimothy's Crossing

A Frogger-style mobile browser game starring Jimothy, Seattle's famous chunky raccoon. Part of [Peter's Arcade](https://ploug76.github.io/peters-arcade/).

Play: https://ploug76.github.io/jimothys-crossing/

- `index.html` is built from `src/` by `build.sh` (which also injects the cover/OG tags and the Share/Install dock).
- `test/overlap_test.py` checks that no pop-up, label or button overlaps; `test/func_test.py` covers controls, pause, saving and offline; `test/runbot2.py` has a planning bot clear the levels.
