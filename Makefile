all:
	node compiler.js new-test.js > test.s
	gcc jsruntime.c test.s -o test 
	./test
