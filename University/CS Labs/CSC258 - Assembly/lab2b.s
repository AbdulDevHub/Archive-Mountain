.data
prompt:       .string "Enter an integer:\n"
oddMsg:       .string "THIS IS ODD\n"
evenMsg:      .string "THIS IS EVEN\n"
tooManyMsg:   .string "TOO MANY TIMES\n"
N:            .word 5            # maximum number of odd attempts allowed

.text
.globl main
main:
    # Load N into t2 (counter for max attempts)
    la t1, N
    lw t2, 0(t1)        # t2 = N

LOOP:
    # Prompt user
    li a7, 4
    la a0, prompt
    ecall

    # Read integer
    li a7, 5
    ecall
    mv t0, a0           # save input into t0

    # Check odd/even
    andi t3, t0, 1      # t3 = t0 & 1
    beq t3, x0, EVEN    # if even → branch to EVEN

    # If odd → print ODD
    li a7, 4
    la a0, oddMsg
    ecall

    addi t2, t2, -1     # decrement attempts left
    beq t2, x0, TOO_MANY   # if t2 == 0 → TOO MANY TIMES
    j LOOP              # otherwise, ask again

EVEN:
    li a7, 4
    la a0, evenMsg
    ecall
    j EXIT

TOO_MANY:
    li a7, 4
    la a0, tooManyMsg
    ecall

EXIT:
    li a7, 10           # exit
    ecall
