.data
# These lines allocate and initialize strings in memory
promptA:    .string "Enter an int A:\n"
promptB:    .string "Enter an int B:\n"
resultAdd:  .string "A + 42 = "
resultMul:  .string "B - A = "
newline:    .string "\n"

.globl main
.text

main:
# Prompt user for A
li a7, 4              # syscall code 4 = print string
la a0, promptA        # load address of "Enter an int A:"
ecall                 # print it

li a7, 5              # syscall code 5 = read integer
ecall                 # read user input, result in a0
mv t0, a0             # save A into t0

# Prompt user for B
li a7, 4              # syscall code 4 = print string
la a0, promptB        # load address of "Enter an int B:"
ecall                 # print it

li a7, 5              # syscall code 5 = read integer
ecall                 # read user input, result in a0
mv t1, a0             # save B into t1

# Compute A + 42
addi t2, t0, 42       # t2 = A + 42
li a7, 4              # print string
la a0, resultAdd      # load address of "A + 42 = "
ecall

li a7, 1              # print integer
mv a0, t2             # move result into a0
ecall

li a7, 4              # print string
la a0, newline        # print newline
ecall

# Compute B - A
sub t3, t1, t0        # t3 = B - A
li a7, 4              # print string
la a0, resultMul      # load address of "B - A = "
ecall

li a7, 1              # print integer
mv a0, t3             # move result into a0
ecall

li a7, 4              # print string
la a0, newline        # print newline
ecall

# Exit
li a7, 10             # syscall code 10 = exit
ecall
