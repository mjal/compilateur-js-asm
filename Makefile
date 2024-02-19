all: compiler.js new-test.js jsruntime.c
	node compiler.js new-test.js > test.s
	gcc jsruntime.c test.s -o main 
	./main

test: jsruntime.c jsruntime_test.c
	gcc jsruntime.c jsruntime_test.c -o test 
	./test
