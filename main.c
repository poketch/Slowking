#include "main.h"

unsigned int roll_die(unsigned int sides) {
    log("MESSAGE", "rolling d%d %s", sides, "foo");
    return 1 + (unsigned int)(randf() * sides);
}
