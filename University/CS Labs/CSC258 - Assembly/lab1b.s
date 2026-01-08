.data
promptA:    .string "Enter an int A:\n"   # String to prompt the user for A
promptB:    .string "Enter an int B:\n"   # String to prompt the user for B
promptC:    .string "Enter an int C:\n"   # String to prompt the user for C
resultSum:  .string "A + B + C = "        # Label string for the sum result
newline:    .string "\n"                  # Newline string for formatting

.globl main
.text

main:
# Prompt user for A
li a7, 4              # Load syscall code 4 (print string)
la a0, promptA        # Load address of "Enter an int A:" into a0
ecall                 # Print the prompt string

li a7, 5              # Load syscall code 5 (read integer)
ecall                 # Wait for user to enter an integer, result in a0
mv t0, a0             # Move input value (A) into t0

# Prompt user for B
li a7, 4              # Load syscall code 4 (print string)
la a0, promptB        # Load address of "Enter an int B:" into a0
ecall                 # Print the prompt string

li a7, 5              # Load syscall code 5 (read integer)
ecall                 # Wait for user to enter an integer, result in a0
mv t1, a0             # Move input value (B) into t1

# Prompt user for C
li a7, 4              # Load syscall code 4 (print string)
la a0, promptC        # Load address of "Enter an int C:" into a0
ecall                 # Print the prompt string

li a7, 5              # Load syscall code 5 (read integer)
ecall                 # Wait for user to enter an integer, result in a0
mv t2, a0             # Move input value (C) into t2

# Compute A + B + C
add t3, t0, t1        # t3 = A + B
add t3, t3, t2        # t3 = (A + B) + C

# Print result label
li a7, 4              # Load syscall code 4 (print string)
la a0, resultSum      # Load address of "A + B + C = " string
ecall                 # Print result label

# Print result value
li a7, 1              # Load syscall code 1 (print integer)
mv a0, t3             # Move sum result into a0
ecall                 # Print the integer result

# Print newline
li a7, 4              # Load syscall code 4 (print string)
la a0, newline        # Load address of newline string
ecall                 # Print newline to format output

# Exit program
li a7, 10             # Load syscall code 10 (exit program)
ecall                 # Exit cleanly
