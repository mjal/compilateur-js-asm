#ifndef JSRUNTIME_H
#define JSRUNTIME_H

struct field_s {
  char *name;
  int  value;
  struct field_s *next;
};

struct obj_s {
  struct field_s *head;
  struct obj_s *next;
};

struct obj_s *obj_new();
int obj_get(struct obj_s *obj, char *name);
int obj_set(struct obj_s *obj, char *name, int value);

#endif
