.section .data
__var__obj:

.section .text
.global main

main:
    call obj_new
    movl $1, %edi
    call obj_set
    popq %rax
    movq %rax, %rdi
