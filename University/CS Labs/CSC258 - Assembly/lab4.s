.data
prompt:     .string "Enter a number:\n"
resultMsg:  .string "The result is: "
newline:    .string "\n"

.text
.globl main

main:
    # Prompt user
    li a7, 4
    la a0, prompt
    ecall

    # Read integer n
    li a7, 5
    ecall
    mv a0, a0               # a0 holds n (argument to mystery)

    # Call mystery(n)
    jal mystery

    # Save result before printing strings
    mv t3, a0               # t3 = result

    # Print "The result is: "
    li a7, 4
    la a0, resultMsg
    ecall

    # Print result as integer
    li a7, 1
    mv a0, t3               # restore result into a0
    ecall

    # Print newline
    li a7, 4
    la a0, newline
    ecall

    # Exit
    li a7, 10
    ecall


# ====================================================
# mystery(n):
# Input:  a0 = n
# Output: a0 = result
# ====================================================
mystery:
    # ---- Set up stack frame ----
    addi sp, sp, -8         # make room for 2 words
    sw ra, 4(sp)            # save return address
    sw a0, 0(sp)            # save argument n

    # ---- Base case: if n == 0 return 0 ----
    beq a0, x0, BASECASE

    # ---- Recursive case ----
    addi a0, a0, -1         # prepare argument (n-1)
    jal mystery             # call mystery(n-1)
    # result of recursive call now in a0

    # Restore original n from stack
    lw t0, 0(sp)

    # Compute 2*n - 1
    slli t1, t0, 1          # t1 = n*2
    addi t1, t1, -1         # t1 = 2*n - 1

    add a0, a0, t1          # result = recursive + (2*n - 1)
    j ENDCASE

BASECASE:
    li a0, 0                # return 0

ENDCASE:
    # ---- Restore and return ----
    lw ra, 4(sp)            # restore return address
    addi sp, sp, 8          # pop stack frame
    jr ra                   # return
