#include "jsruntime.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct obj_s *objs = NULL;

struct obj_s *obj_new() {
  struct obj_s *obj = malloc(sizeof(struct obj_s));
  obj->head = NULL;
  obj->next = objs;
  objs = obj;
  return obj;
}

int obj_get(struct obj_s *obj, char *name) {
  struct field_s *field = obj->head;
  while (field != NULL) {
    if (strcmp(field->name, name) == 0)
      return field->value;
    field = field->next;
  }
  return -1;
}

int obj_set(struct obj_s *obj, char *name, int value) {
  struct field_s *field = obj->head;
  while (field != NULL) {
    if (strcmp(field->name, name) == 0) {
      field->value = value;
    }
    field = field->next;
  }
  struct field_s *newField = malloc(sizeof(struct field_s));
  newField->next = obj->head;
  obj->head = newField;
  return 0;
}

void obj_gc(struct obj_s **localVariables, int nLocalVariables) {
  // Use an array of all allocated objects
  // Compare to the map of all global variables
  // The map can maybe be passed through an obj_init call
  struct obj_s *obj = objs;
  struct obj_s *prev = objs;
  while (obj != NULL) {
    int i = 0;
    for (int i = 0; i < nLocalVariables; i++) {
      if (obj == localVariables[i])
        break;
    }
    if (i == nLocalVariables) {
      prev->next = obj->next;
      free(obj);
    }
    prev = obj;
  }
}
