# NAME: Abdul Khan
# Q1: 5 Stages of Pipelined Processor
# 1.
# a. IF (Instruction Fetch)
# b. Purpose: Fetch the instruction from memory and increment the PC.
# c. Hardware: Instruction memory, PC register, adder (PC+4), IF/ID pipeline register.
#
# 2.
# a. ID (Instruction Decode / Register Fetch)
# b. Purpose: Decode the instruction, read source registers, and compute immediates.
# c. Hardware: Register file (read ports), control unit, immediate generator, IF/ID and ID/EX pipeline registers.
#
# 3.
# a. EX (Execute / ALU)
# b. Purpose: Perform arithmetic/logic operations or compute memory addresses.
# c. Hardware: ALU, ALU control, forwarding logic (if present), ID/EX and EX/MEM pipeline registers.
#
# 4.
# a. MEM (Memory access)
# b. Purpose: Read from or write to data memory for load/store instructions.
# c. Hardware: Data memory, address/data buses, EX/MEM and MEM/WB pipeline registers.
#
# 5.
# a. WB (Write Back)
# b. Purpose: Write results back into the register file (for loads/ALU results).
# c. Hardware: Register file write port, MUX to select between ALU/memory results, MEM/WB pipeline register.
#
# Q2: 
# c. With the 5-stage processor *with forwarding* it also works correctly without the nops (forwarding resolves the RAW hazards).
# d.
# Instruction count (original program): 12 instructions
# Num_Cycles 5-stage: Ideal pipelined cycles = N + (pipeline_depth - 1) = 12 + 4 = 16 cycles.
# ====
# Total instructions executed (including nops) = 12 + 14 = 26 instructions
# Num_Cycles 5-stage w/o forwarding or hazard detection: 26 + (pipeline_depth - 1) = 26 + 4 = 30 cycles
# ====
# Speedup: cycles_w/o_forwarding / cycles_with_forwarding = 30 / 16 = 1.875x
#
# Q3:
# Single-Cycle Processor:
#    a. Clock cycle time = sum(IF+ID+EX+MEM+WB) = 200 + 150 + 300 + 150 + 250 = 1050 ps
#    b. Latency per sw instruction = 1050 ps (single-cycle does whole instruction in one cycle)
#    c. For the short program: total time = 5 cycles * 1050ps = 5250 ps
#
# 5-stage Processor w/o Forwarding Unit
#    a. Clock cycle time = max(IF,ID,EX,MEM,WB) = max(200,150,300,150,250) = 300 ps
#    b. Latency per sw instruction (in cycles) = 5 cycles -> latency time = 5 * 300 = 1500 ps
#    c. Using the short program: total time = 9 cycles * 300 = 2700 ps -> speedup over single-cycle = 5250 / 3300 = 1.9444x
#
# 5-stage Processor (Pipelined, with forwarding)
#    a. Clock cycle time = 300 ps (same reasoning: governed by slowest stage EX = 300 ps)
#    b. Latency per sw = 5 cycles = 5 * 300 = 1500 ps
#    c. For the short program: ideal pipelined cycles = N + (pipeline_depth-1) = 5 + 4 = 9 cycles -> time = 9 * 300 = 2700 ps
#       speedup over single-cycle = 5250 / 2700 = 1.9444x
 
# Version A: original code with comments showing final array values (Q2a)
.text
main:
    auipc s0, 0x10000       # load the memory address at which we store the array (base in s0)
    li x3, 7
    li x4, 15
    sw x3, 0(s0)            # store at offset 0  -> value stored: 7
    addi x3, x3, 2
    sw x3, 4(s0)            # store at offset 4  -> value stored: 9
    addi x3, x3, 2
    sw x3, 8(s0)            # store at offset 8  -> value stored: 11
    addi x3, x3, 2
    sw x3, 12(s0)           # store at offset 12 -> value stored: 13
    addi x3, x3, 2
    sw x3, 16(s0)           # store at offset 16 -> value stored: 15

# -------------------------
# Version B: nops added so this works on a 5-stage processor WITHOUT forwarding/hazard detection (Q2b)
# Explanation of nops:
#  - Between li x3 and the sw that uses x3 we have li x4 in-between (that uses a different register), but that single
#    instruction does NOT delay long enough for x3 to be written back. Therefore we add 2 nops AFTER li x4.
#  - After each addi (which produces x3) we insert 3 nops before the following sw that consumes x3.
#
# If you run this on the single-cycle processor, the nops are harmless; on a forwarding pipeline you don't need them,
# but on a pipeline without forwarding they'll be required for correctness.
.text
main_nops:
    auipc s0, 0x10000
    li x3, 7
    li x4, 15
    nop
    nop
    sw x3, 0(s0)            # 7
    addi x3, x3, 2
    nop
    nop
    nop
    sw x3, 4(s0)            # 9
    addi x3, x3, 2
    nop
    nop
    nop
    sw x3, 8(s0)            # 11
    addi x3, x3, 2
    nop
    nop
    nop
    sw x3, 12(s0)           # 13
    addi x3, x3, 2
    nop
    nop
    nop
    sw x3, 16(s0)           # 15