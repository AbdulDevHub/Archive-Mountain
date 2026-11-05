# NAME: Abdul 
# Q1: The Third Configuration Performs Best
# Configuration |   Hit Rate   |   Hits   | Misses | Writebacks |
#       1       |     0.079%   |   021    |   242  |    000     |   
#       2       |     0.231%   |   061    |   202  |    060     |                  
#       3       |     0.323%   |   085    |   178  |    047     |   
#       4       |     0.102%   |   027    |   236  |    000     |   
#       5       |     0.319%   |   084    |   179  |    030     |   
#
# Question 2: 
#      2.5      |     0.140%   |   037    |   226  |    060     |   
#
# Q3:
# For a cache with 1024 data bits, the total number of data bits is:
#       (2^lines) × (2^ways) × (2^blocks) × 32 bits per word
#
# If the sum of the exponents is 5:
#       (2^a) × (2^b) × (2^c) = 2^(a+b+c) = 2^5 = 32 words
# And since each word is 32 bits:
#       32 words × 32 bits = 1024 data bits
#
# So ANY cache configuration where:
#       lines_exp + ways_exp + blocks_exp = 5
# will give exactly 1024 bits of data capacity.
#
# Best configuration I found:
#       2^n Lines:  n = 2   →   4 lines
#       2^n Ways:   n = 2   →   4-way set associative
#       2^n Blocks: n = 1   →   block size = 2 words
#
# Hit Rate: ~ 0.6958%
#
# Why this worked best:
#   • The 4-way associativity greatly reduces conflict misses during matrix-multiply,
#     especially because the access pattern repeatedly walks across rows of A and B.
#   • Having 2 words per block improves spatial locality — once the processor loads
#     one element of a row, the next element is already in the same block.
#   • Combining moderate associativity (4 ways) and moderate block size (2 words)
#     gives a good balance of:
#         – fewer conflict misses
#         – fewer compulsory misses
#         – no wasted space on excessively large blocks
#   • Other configurations (like 1-way or 8-word blocks) performed worse because:
#         – too few ways causes conflict thrashing on the three arrays
#         – too large blocks wastes cache space and increases miss penalties
#
# In summary:
#   This configuration works best because matrix multiplication has predictable
#   row-major access patterns, which benefit from:
#       (1) multiple ways to avoid conflicts
#       (2) small blocks that preserve spatial locality
#

.data
newline:    .string      "\n"
delimiter:  .string      ", "
M:            .word 4
K:            .word 3
N:            .word 5
C:            .zero 80 # M * N * 4 bytes
.align 12 # M x K
A:            .word 4, 4, 3, 0, 1, 1, 3, 2, 4, 1, 1, 2
.align 15 # K x N
B:            .word 3, 2, 1, 0, 3, 5, 5, 4, 2, 5, 4, 5, 3, 0, 2

.text
main:
la s0, A
la s1, B
la s2, C
lw s3, M
lw s4, K
lw s5, N

li t0, 0            # m index
li t1, 0            # k index
li t2, 0            # n index

# ------------------------------------------
# OLD LOOP ORDER (BAD CACHE LOCALITY)
# m → n → k
#
# M_loop_head:
#     beq t0, s3, M_loop_end
#     li t2, 0          # n = 0
#
# N_loop_head:
#     beq t2, s5, N_loop_end
#     li t1, 0          # k = 0
#
# K_loop_head:
#     beq t1, s4, K_loop_end
#     ... multiply ...
#     addi t1, t1, 1
#     j K_loop_head
#
# K_loop_end:
#     addi t2, t2, 1
#     j N_loop_head
#
# N_loop_end:
#     addi t0, t0, 1
#     j M_loop_head
# ------------------------------------------


# ------------------------------------------
# NEW LOOP ORDER (GOOD CACHE LOCALITY)
# m → k → n
# ------------------------------------------

M_loop_head:
    beq t0, s3, M_loop_end
    li t1, 0              # k = 0

K_loop_head:
    beq t1, s4, K_loop_end
    li t2, 0              # n = 0

N_loop_head:
    beq t2, s5, N_loop_end

    # -----------------------------------------------------
    # matrix multiplication, unchanged
    # C[m][n] += A[m][k] * B[k][n]
    # -----------------------------------------------------

    # m * N + n -> t3
    mul t3, t0, s5
    add t3, t3, t2
    slli t3, t3, 2
    add t3, s2, t3
    lw a0, 0(t3)

    # m * K + k -> t4
    mul t4, t0, s4
    add t4, t4, t1
    slli t4, t4, 2
    add t4, s0, t4
    lw a1, 0(t4)

    # k * N + n -> t5
    mul t5, t1, s5
    add t5, t5, t2
    slli t5, t5, 2
    add t5, s1, t5
    lw a2, 0(t5)

    # multiply
    mul t6, a1, a2
    add a0, a0, t6

    sw a0, 0(t3)

    # next n
    addi t2, t2, 1
    j N_loop_head

N_loop_end:
    addi t1, t1, 1        # next k
    j K_loop_head

K_loop_end:
    addi t0, t0, 1        # next m
    j M_loop_head


M_loop_end:

    # print logic unchanged
    mul s6, s3, s5
    li t0, 0

print_row_head:
    beq t0, s3, print_row_end
    li t1, 0

print_col_head:
    beq t1, s5, print_col_end
    mul t2, t0, s5
    add t2, t2, t1
    slli t2, t2, 2
    add t2, s2, t2
    jal print_value
    jal print_delimiter
    addi t1, t1, 1
    j print_col_head

print_col_end:
    addi t0, t0, 1
    jal print_new_line
    j print_row_head

print_row_end:
    j exit

print_value:
    lw a0, 0(t2)
    li a7, 1
    ecall
    jr x1

print_delimiter:
    la a0, delimiter
    li a7, 4
    ecall
    jr x1

print_new_line:
    la a0, newline
    li a7, 4
    ecall
    jr x1

exit:
    li a7, 10
    ecall
