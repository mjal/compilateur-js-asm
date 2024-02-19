#ifndef JSRUNTIME_H
#define JSRUNTIME_H

struct field_s {
  char *name;
  int  value;
  struct field_s *next;
};

struct obj_s {
  struct field_s *head;
};

#endif
