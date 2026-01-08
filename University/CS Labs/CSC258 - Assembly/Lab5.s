# NAME: Abdul Khan
# Q1: The pair of instructions "add a0, a0, a1" and "sw a0, 0(zero)" differ in their control signals.
#     The 'add' instruction sets Register Write Enable high (since it writes the ALU result to a0),
#     while the 'sw' instruction sets Data Memory Write Enable high instead (writing to memory),
#     with Register Write Enable low because it doesn’t write to a register.
# Q2: The instruction "beq a0, a0, label" triggers the given control signals.
#     It sets BranchTaken high (since the branch condition is true),
#     Register Write Enable off, and Data Memory Write Enable off.
# Q3: The screenshot showing Registers WrEn = OFF and Data Memory WrEn = ON corresponds to a store.
#     In the starter code, this is "sw a0, 0(zero)". A store writes to memory (MemWrite=1)
#     and does not write back to the register file (RegWrite=0), which matches the datapath signals.

#     When Register Write Enable is low (off/red), the processor is not writing to any register.
#     When Data Memory Write Enable is high (on/green), it means the processor is writing data
#     into memory. This combination corresponds to a store instruction (sw), since stores write
#     a value from a register into memory but do not write back to a register.
#     Therefore, the instruction being executed is "sw a0, 0(zero)".
.data
foo: .word 15
.text
main:
sw a0, 0(zero)
li a1, 2
li t0, 10
# beq a0, a0, end
begin:
add a0, a0, a1
and a2, a0, a1
end:
lw a0, foo
li a7, 10
ecall