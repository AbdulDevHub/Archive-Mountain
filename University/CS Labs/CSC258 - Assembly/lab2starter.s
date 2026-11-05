.global _start
_start:

#================================ PART 1: BRANCHING=====================
# if x < 5 {
	# y = 1
# }
# else {
	# y = 2
# }

IF: # This label isn’t required but is added for clarity.
	li t1, 5 			# Prepare to evaluate x < 5.
	bge t0, t1, ELSE 	# Branch to the label ELSE if the predicate is False.

THEN: # This label isn’t required but is added for clarity.
	li t2, 1
	j DONE

ELSE:
	li t2, 2
	
DONE: 	# This label marks the end of the If-Else.
	li a7, 10	# There may be more code below! It won’t exit the
	ecall		# program unless you use syscall exit, like last week.
	
#================================ PART 2: LOOPS=====================
# x = 0
# while x < 5 {
	# x = x + 1
# }

LOOPINIT: # Many loops have an initialization section.
	li t0, 0

WHILE: # The loop checks the condition, then evaluates the body.
	li t1, 5
	bge t0, t1, DONE
	addi t0, t0, 1
	j WHILE

DONE: # This label marks the end of the loop.
	li a7, 10
	ecall