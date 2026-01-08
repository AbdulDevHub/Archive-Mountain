.data
prompt:     .string "Enter an integer:\n"
oddMsg:     .string "THIS IS ODD\n"
evenMsg:    .string "THIS IS EVEN\n"

.text
.globl main
main:
    # Prompt user for input
    li a7, 4              # syscall: print string
    la a0, prompt
    ecall

    li a7, 5              # syscall: read integer
    ecall
    mv t0, a0             # save user input into t0

    # Check odd/even using andi
    andi t1, t0, 1        # t1 = t0 & 1  (check least significant bit)
						  # andi t1, t0, 1 extracts the lowest bit of the number:
						  # If it’s 0 → even OR if it’s 1 → odd
    beq t1, x0, EVEN      # if (t1 == 0) → EVEN

ODD:
    li a7, 4
    la a0, oddMsg
    ecall
    j EXIT

EVEN:
    li a7, 4
    la a0, evenMsg
    ecall

EXIT:
    li a7, 10             # syscall: exit
    ecall

# ================= IF/THEN/ELSE VERSION ==========================
#.data
#prompt:     .string "Enter an integer:\n"
#oddMsg:     .string "THIS IS ODD\n"
#evenMsg:    .string "THIS IS EVEN\n"

#.text
#.globl main
#main:
#    # Prompt user for input
#    li a7, 4              # syscall: print string
#    la a0, prompt
#    ecall

#    li a7, 5              # syscall: read integer
#    ecall
#    mv t0, a0             # save user input into t0

#    #========== IF / ELSE STYLE ==========
#    # if (t0 & 1 != 0)  then ODD else EVEN

#    andi t1, t0, 1        # t1 = t0 & 1  (check lowest bit)
#    beq t1, x0, ELSE      # if (t1 == 0) go to ELSE branch

#THEN:                     # (ODD branch)
#    li a7, 4
#    la a0, oddMsg
#    ecall
#    j DONE

#ELSE:                     # (EVEN branch)
#    li a7, 4
#    la a0, evenMsg
#    ecall

#DONE:
#    li a7, 10             # syscall: exit
#    ecall
