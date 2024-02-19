#include "jsruntime.h"
#include <stdio.h>
#include <stdlib.h>

struct obj_s *obj_new() {
  printf("OBJ_NEW\n");
  return malloc(sizeof(struct obj_s));
}

int obj_get(struct obj_s *obj, char *name) {
  printf("OBJ_GET %s\n", name);
  return 0;
}

int obj_set(struct obj_s *obj, char *name, int value) {
  printf("OBJ_SET %s\n", name, value);
  return 0;
}

void obj_gc() {
  // Use an array of all allocated objects
  // Compare to the map of all global variables
  // The map can maybe be passed through an obj_init call
}
