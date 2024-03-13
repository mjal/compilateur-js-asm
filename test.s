.section .data
__var__obj:

.section .text
.global main

main:
    call obj_new
    mov %rax, %rbx
    call obj_set
;    popq %rax
;    movq %rax, %rdi
