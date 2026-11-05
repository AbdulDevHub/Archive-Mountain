.data
promptN:     .string "Enter number of integers to multiply (must be > 0):\n"
promptNum:   .string "Enter an integer:\n"
resultMsg:   .string "The product is: "
newline:     .string "\n"

.text
.globl main
main:
# ================= Ask for N (with validation loop) =================
ASK_N:
    li a7, 4
    la a0, promptN
    ecall

    li a7, 5
    ecall
    mv t0, a0          # t0 = N

    ble t0, x0, ASK_N     # if N <= 0, ask again

# ================= Multiply N numbers =================
    li t1, 1           # product accumulator = 1
    li t2, 0           # loop counter = 0

LOOP:
    bge t2, t0, DONE   # if counter >= N, exit loop

    # Prompt user for integer
    li a7, 4
    la a0, promptNum
    ecall

    li a7, 5
    ecall              # read integer
    mv t3, a0

    mul t1, t1, t3     # product *= input

    addi t2, t2, 1     # counter++

    j LOOP

# ================= Print Result =================
DONE:
    li a7, 4
    la a0, resultMsg
    ecall

    li a7, 1           # print product
    mv a0, t1
    ecall

    li a7, 4           # newline
    la a0, newline
    ecall

# ================= Exit =================
    li a7, 10
    ecall
