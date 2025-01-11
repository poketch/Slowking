clang -Os -fno-builtin -Wall -Wextra -Wswitch-enum -pedantic --target=wasm32\
 --no-standard-libraries\
  -Wl,--export-all\
  -Wl,--no-entry\
  -Wl,--allow-undefined\
  -o main.wasm main.c
