#include "jsruntime.h"
#include <stdio.h>
#include <stdlib.h>

int main() {
  struct obj_s *obj = obj_new();

  obj_set(obj, "key",  10);
  obj_set(obj, "key2", 30);

  //printf("key:  %d\n", obj_get(obj, "key"));
  //printf("key2: %d\n", obj_get(obj, "key2"));
  //printf("key3: %d\n", obj_get(obj, "key3"));

  return 0;
}
