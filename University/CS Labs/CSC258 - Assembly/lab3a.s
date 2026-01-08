.data
array1:     .word 5, 8, 3, 4, 7, 2   # array elements
arr_size:   .word 6                   # number of elements
resultMsg:  .string "The product is: "
newline:    .string "\n"

.text
.globl main
main:
    # Load address of array
    la t0, array1        # t0 = base address of array
    lw t1, arr_size      # t1 = number of elements
    li t2, 1             # accumulator (product = 1)
    li t3, 0             # loop counter (i = 0)

LOOP:
    bge t3, t1, DONE     # if i >= arr_size, exit loop

    lw t4, 0(t0)         # load array[i]
    mul t2, t2, t4       # product *= array[i]

    addi t0, t0, 4       # move to next element
    addi t3, t3, 1       # i++
    j LOOP

# ================= Print Result =================
DONE:
    li a7, 4
    la a0, resultMsg
    ecall

    li a7, 1             # print product
    mv a0, t2
    ecall

    li a7, 4             # newline
    la a0, newline
    ecall

# ================= Exit =================
    li a7, 10
    ecall
