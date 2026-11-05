.data
# TODO: What are the following 5 lines doing?
promptA: .string "Enter an int A:\n"
promptB: .string "Enter an int B:\n"
resultAdd: .string "A + B = "
resultMul: .string "A * B = "
newline: .string "\n"

.globl main
.text

main:
# TODO: Set a breakpoint here and step through.
# What does this block of 3 lines do?
li a7, 4              # Load immediate value 4 into register a7 (syscall code for printing a string)
la a0, promptA        # Load the address of string "promptA" into a0 (argument register for syscalls)
ecall                 # Make the system call → prints promptA to the console

# TODO: Set a breakpoint here and step through.
# What does this block of 2 lines do?
li a7, 5              # Load immediate value 5 into a7 (syscall code for reading an integer)
ecall                 # Make the system call → user enters an integer, result is placed in a0
mv t0, a0             # Move the entered integer (in a0) into temporary register t0

# TODO: What is the value of "promptB"? Hint: Check the
# value of a0 and see what it corresponds to.
li a7, 4              # Load syscall code 4 (print string)
la a0, promptB        # Load the address of string "promptB" into a0
ecall                 # Print promptB to the console

# TODO: Explain what happens if a non-integer is entered
# by the user.
li a7, 5              # Prepare syscall for reading an integer
ecall                 # User input is requested; if non-integer entered → input fails or program behavior is undefined
                      # (typically, program may crash or leave garbage value in a0)

# TODO: t stands for "temp" -- why is the value from a0
# being moved to t1?
mv t1, a0             # Move the integer input value from a0 into t1 for later use (so it’s not overwritten)

# TODO: What if I want to get A + 1 and B + 42 instead?
add t2, t1, t0        # Add t1 and t0, result stored in t2  (currently computing A + B)
mul t3, t0, t1        # Multiply t0 and t1, result stored in t3 (currently computing A * B)
li a7, 4              # Prepare syscall to print string
la a0, resultAdd      # Load address of "resultAdd" string into a0
ecall                 # Print "resultAdd" label

# TODO: What is the difference between "li" and "mv"?
li a7, 1              # Load immediate value 1 into a7 (syscall code for printing an integer)
mv a0, t2             # Move result of addition (t2) into a0 (argument for syscall)
ecall                 # Print the integer value in a0 (sum result)

# TODO: Why is the next block of three lines needed?
# Remove them and explain what happens.
li a7, 4              # Prepare syscall for printing a string
la a0, newline        # Load address of newline string
ecall                 # Print newline to format output nicely

li a7, 4              # Prepare syscall for printing string
la a0, resultMul      # Load address of "resultMul" label string
ecall                 # Print "resultMul" label

mv a0, t3             # Move result of multiplication into a0
li a7, 1              # Load syscall code for printing an integer
ecall                 # Print multiplication result

li a7, 4              # Prepare syscall for printing string
la a0, newline        # Load address of newline string
ecall                 # Print newline for clean output formatting

li a7, 10             # Load syscall code 10 (exit program)
ecall                 # Exit the program
