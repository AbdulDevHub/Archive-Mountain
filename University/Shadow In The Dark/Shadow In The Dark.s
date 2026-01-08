# ========================================
# SHADOW IN THE DARK
# ========================================
# A game where you must light candles while avoiding shadow monsters
#
# SYMBOLS:
#   . = floor
#   # = wall
#   @ = character
#   M = match (unlit)
#   C = candle (unlit)
#   * = candle (lit)
#   S = shadow monster
#
# CONTROLS:
#   w = move up
#   s = move down
#   a = move left
#   d = move right
#   u = undo last move
#   r = restart game
#   q = quit game
#
# RANDOM NUMBER GENERATOR:
#   Linear Congruential Generator (LCG)
#   Formula: X(n+1) = (a * X(n) + c) mod m
#   Parameters: a = 1664525, c = 1013904223, m = 2^32
#   Reference: Park, S. K., & Miller, K. W. (1988). 
#   "Random number generators: good ones are hard to find."
#   Communications of the ACM, 31(10), 1192-1203.
#   Available at: https://dl.acm.org/doi/10.1145/63039.63042
#
# ========================================
# ENHANCEMENTS IMPLEMENTED
# ========================================
#
# ENHANCEMENT 1: UNLIMITED UNDO FUNCTIONALITY
# --------------------------------------------
# Location: Labels: push_state, pop_state, clear_undo_stack
#           Data structures: undo_stack_buffer, undo_stack_base, undo_stack_ptr
#           Integration: move_character (calls push_state), game_loop (handles 'u' input)
#
# Implementation Details:
# - Dedicated 4KB buffer (undo_stack_buffer) allocated in .data section for storing game states
# - Each state stores 8 bytes: character position (2), shadow position (2), 
#   fear factor (1), hasMatch flag (1), candleLit flag (1), padding (1)
# - Stack grows downward from buffer top, allowing unlimited undo operations
# - push_state: Saves current game state before each move
# - pop_state: Restores previous state when 'u' is pressed, returns success/failure
# - clear_undo_stack: Resets stack pointer at game start/restart
# - Integrated into move_character to auto-save before moves
# - Player can press 'u' repeatedly to undo unlimited moves
# - Undoing restores: character position, shadow position, fear level, 
#   match pickup status, and candle lit status
#
# ENHANCEMENT 2: MULTIPLAYER COMPETITIVE MODE
# --------------------------------------------
# Location: Data structures: num_players, current_player, player_scores_ptr, player_ids_ptr,
#           init_character, init_match, init_candle, init_shadow
#           Labels: get_num_players, init_player_data, show_leaderboard, 
#           wait_for_enter, reset_to_initial_map
#           Main multiplayer loop: _start section after initialization
#
# Implementation Details:
# - Prompts for number of players (minimum 1, no maximum limit)
# - Dynamic memory allocation via sbrk syscall for unlimited players
# - Two heap-allocated arrays:
#   * player_scores_ptr: Stores final fear gauge for each player (1 byte each)
#   * player_ids_ptr: Tracks original player numbers after sorting (4 bytes each)
# - Each player plays the SAME map using reset_to_initial_map which restores 
#   initial positions saved during init_game (init_character, init_match, init_candle, init_shadow)
# - Turn-based system with current_player counter tracking whose turn it is
# - After all players finish, scores are sorted using bubble sort algorithm
# - Leaderboard displays rankings with original player IDs preserved through parallel array sorting
# - Tie detection: Counts players with identical lowest fear score
# - Winner announcement or tie message displayed accordingly with all tied players listed
# - Player transition handled with wait_for_enter to allow player switching between turns
#
# Key Design Decisions:
# - Word alignment ensured for player data structures (.align 2 directives)
# - Initial map positions saved separately (init_character, init_match, etc.) 
#   to enable identical map replay for fairness
# - Bubble sort maintains player ID pairing during sorting for correct attribution
# - Fear gauge is the scoring metric (lower is better)
#
# ========================================

.data
gridsize: .byte 8, 8
character: .byte 0, 0
match: .byte 0, 0
candle: .byte 0, 0
shadowMonster: .byte 0, 0
fearFactor: .byte 0
hasMatch: .byte 0        # 1 if character has picked up match
candleLit: .byte 0       # 1 if candle is lit

# Multiplayer data (word-aligned)
    .align 2             # Ensure word alignment
num_players: .word 0     # Changed to word to support unlimited players
current_player: .word 0  # Changed to word, 0-indexed

# Store initial positions for map reset
    .align 2             # Ensure alignment before next section
init_character: .byte 0, 0
init_match: .byte 0, 0
init_candle: .byte 0, 0
init_shadow: .byte 0, 0

# Dynamic arrays for unlimited players (allocated at runtime on heap)
    .align 2             # Ensure word alignment
player_scores_ptr: .word 0      # Pointer to dynamically allocated scores array
player_ids_ptr: .word 0         # Pointer to player ID array (for tracking after sorting)

    .align 2             # Ensures seed is word-aligned
seed: .word 12345        # seed for random number generator

# Undo stack configuration - allocate dedicated buffer
.align 2
undo_stack_buffer: .space 4096  # 4KB buffer for undo stack (512 states * 8 bytes)
undo_stack_base: .word 0    # Base pointer for undo stack (set at start)
undo_stack_ptr: .word 0     # Current undo stack pointer (grows downward)

# Strings for messages
msg_fear: .string "\n>>> Fear increased! Fear gauge: "
msg_game_over: .string "\n>>> GAME OVER! Fear reached 100. The shadows consumed you...\n"
msg_match_pickup: .string "\n>>> You picked up a match!\n"
msg_candle_lit: .string "\n>>> You lit the candle! You survived the night!\n"
msg_need_match: .string "\n>>> You need a match to light the candle!\n"
msg_invalid_move: .string "\n>>> Invalid move! Can't move there.\n"
msg_invalid_input: .string "\n>>> Invalid input! Use w/a/s/d to move, u to undo, r to restart, or q to quit.\n"
msg_welcome: .string "=== SHADOW IN THE DARK ===\n\nThe power is out and something moves in the darkness.\nFind a match, light the candle, and keep the shadows at bay.\nIf your fear reaches 100, it's over...\n\nCompete with friends to see who can survive with the lowest fear!\n\nSymbols:\n  @ = You    M = Match    C = Candle    S = Shadow Monster\n  . = Floor  # = Wall     * = Lit Candle\n\nControls: w/a/s/d to move, u to undo, r to restart, q to quit\n\n"
msg_restart: .string "\n>>> Game restarted!\n\n"
msg_goodbye: .string "\n----------------------------------------------------\n>>> THANKS FOR PLAYING. STAY SAFE IN THE DARK...\n----------------------------------------------------\n"
msg_input_prompt: .string "Enter move: "
msg_ask_width: .string "Enter board width (minimum 5): "
msg_ask_height: .string "Enter board height (minimum 5): "
msg_invalid_size: .string "Invalid size! Boards smaller than 5 are unplayable. Please try again.\n"
msg_undo_success: .string "\n>>> Undo successful!\n"
msg_undo_empty: .string "\n>>> Nothing to undo!\n"
msg_ask_players: .string "Enter number of players (1 or more): "
msg_invalid_players: .string "Invalid number! Please enter 1 or more.\n"
msg_player_turn: .string "\n========================================\n>>> PLAYER "
msg_turn_suffix: .string "'S TURN\n========================================\n"
msg_player_finished: .string "\n>>> Player "
msg_finished_fear: .string " finished with fear: "
msg_press_enter: .string "\nPress ENTER for next player..."
msg_leaderboard: .string "\n\n========================================\n           FINAL LEADERBOARD\n========================================\n"
msg_rank: .string "\n"
msg_rank_player: .string ". Player "
msg_rank_fear: .string " => Fear: "
msg_winner: .string "\n>>> WINNER: Player "
msg_winner_fear: .string " with "
msg_winner_suffix: .string " fear!\n========================================\n"
newline: .string "\n"
msg_tie: .string "\n>>> TIE: Player "
msg_tie_separator: .string " & "
msg_tie_fear: .string " with "

.text
.globl _start

# ========================================
# RAND: Linear Congruential Generator
# a0 = max value (exclusive)
# returns a0 in [0, max)
# ========================================
rand:
    addi sp, sp, -12
    sw   t0, 0(sp)
    sw   t1, 4(sp)
    sw   t2, 8(sp)

    mv   t1, a0          # save max
    la   t0, seed
    lw   t2, 0(t0)       # load seed
    
    # LCG formula: seed = (1664525 * seed + 1013904223) mod 2^32
    li   t3, 1664525
    mul  t2, t2, t3      # seed * a
    li   t3, 1013904223
    add  t2, t2, t3      # (seed * a) + c
    
    sw   t2, 0(t0)       # store new seed
    remu a0, t2, t1      # a0 = seed % max

    lw   t2, 8(sp)
    lw   t1, 4(sp)
    lw   t0, 0(sp)
    addi sp, sp, 12
    ret

# ========================================
# PUSH_STATE: Save current game state to undo stack
# ========================================
push_state:
    addi sp, sp, -16
    sw t0, 0(sp)
    sw t1, 4(sp)
    sw t2, 8(sp)
    sw t3, 12(sp)
    
    la t0, undo_stack_ptr
    lw t1, 0(t0)
    addi t1, t1, -8
    
    la t2, character
    lb t3, 0(t2)
    sb t3, 0(t1)
    lb t3, 1(t2)
    sb t3, 1(t1)
    
    la t2, shadowMonster
    lb t3, 0(t2)
    sb t3, 2(t1)
    lb t3, 1(t2)
    sb t3, 3(t1)
    
    la t2, fearFactor
    lb t3, 0(t2)
    sb t3, 4(t1)
    
    la t2, hasMatch
    lb t3, 0(t2)
    sb t3, 5(t1)
    
    la t2, candleLit
    lb t3, 0(t2)
    sb t3, 6(t1)
    
    sb zero, 7(t1)
    
    sw t1, 0(t0)
    
    lw t3, 12(sp)
    lw t2, 8(sp)
    lw t1, 4(sp)
    lw t0, 0(sp)
    addi sp, sp, 16
    ret

# ========================================
# POP_STATE: Restore previous game state from undo stack
# Returns: a0 = 1 if successful, 0 if stack empty
# ========================================
pop_state:
    addi sp, sp, -16
    sw t0, 0(sp)
    sw t1, 4(sp)
    sw t2, 8(sp)
    sw t3, 12(sp)
    
    la t0, undo_stack_ptr
    lw t1, 0(t0)
    la t2, undo_stack_base
    lw t2, 0(t2)
    beq t1, t2, pop_state_empty
    
    lb t3, 0(t1)
    la t2, character
    sb t3, 0(t2)
    
    lb t3, 1(t1)
    sb t3, 1(t2)
    
    lb t3, 2(t1)
    la t2, shadowMonster
    sb t3, 0(t2)
    
    lb t3, 3(t1)
    sb t3, 1(t2)
    
    lb t3, 4(t1)
    la t2, fearFactor
    sb t3, 0(t2)
    
    lb t3, 5(t1)
    la t2, hasMatch
    sb t3, 0(t2)
    
    lb t3, 6(t1)
    la t2, candleLit
    sb t3, 0(t2)
    
    addi t1, t1, 8
    sw t1, 0(t0)
    
    li a0, 1
    
    lw t3, 12(sp)
    lw t2, 8(sp)
    lw t1, 4(sp)
    lw t0, 0(sp)
    addi sp, sp, 16
    ret
    
pop_state_empty:
    li a0, 0
    
    lw t3, 12(sp)
    lw t2, 8(sp)
    lw t1, 4(sp)
    lw t0, 0(sp)
    addi sp, sp, 16
    ret

# ========================================
# CLEAR_UNDO_STACK: Reset undo stack
# ========================================
clear_undo_stack:
    addi sp, sp, -8
    sw t0, 0(sp)
    sw t1, 4(sp)
    
    la t0, undo_stack_buffer
    li t1, 4096
    add t0, t0, t1
    
    la t1, undo_stack_ptr
    sw t0, 0(t1)
    
    la t1, undo_stack_base
    sw t0, 0(t1)
    
    lw t1, 4(sp)
    lw t0, 0(sp)
    addi sp, sp, 8
    ret

# ========================================
# GET_CELL_CHAR: Get the character for a cell
# Input: a0 = x, a1 = y
# Output: a0 = character to display
# ========================================
get_cell_char:
    addi sp, sp, -16
    sw t0, 0(sp)
    sw t1, 4(sp)
    sw t2, 8(sp)
    sw t3, 12(sp)
    
    la t0, gridsize
    lb t5, 0(t0)
    lb t6, 1(t0)
    
    beqz a0, is_wall
    addi t5, t5, -1
    beq a0, t5, is_wall
    
    beqz a1, is_wall
    addi t6, t6, -1
    beq a1, t6, is_wall
    
    j check_character

is_wall:
    li a0, 35
    j get_cell_done

check_character:
    la t0, character
    lb t1, 0(t0)
    lb t2, 1(t0)
    bne a0, t1, check_match
    bne a1, t2, check_match
    li a0, 64
    j get_cell_done

check_match:
    la t0, hasMatch
    lb t3, 0(t0)
    bnez t3, check_candle

    la t0, match
    lb t1, 0(t0)
    lb t2, 1(t0)
    bne a0, t1, check_candle
    bne a1, t2, check_candle
    li a0, 77
    j get_cell_done

check_candle:
    la t0, candle
    lb t1, 0(t0)
    lb t2, 1(t0)
    bne a0, t1, check_shadow
    bne a1, t2, check_shadow

    la t0, candleLit
    lb t3, 0(t0)
    beqz t3, candle_unlit
    li a0, 42
    j get_cell_done
candle_unlit:
    li a0, 67
    j get_cell_done

check_shadow:
    la t0, shadowMonster
    lb t1, 0(t0)
    lb t2, 1(t0)
    bne a0, t1, empty_cell
    bne a1, t2, empty_cell
    li a0, 83
    j get_cell_done

empty_cell:
    li a0, 46

get_cell_done:
    lw t3, 12(sp)
    lw t2, 8(sp)
    lw t1, 4(sp)
    lw t0, 0(sp)
    addi sp, sp, 16
    ret

# ========================================
# PRINT_BOARD: Print the game board
# ========================================
print_board:
    addi sp, sp, -16
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    sw s2, 12(sp)
    
    la t0, gridsize
    lb s0, 0(t0)
    lb s1, 1(t0)
    
    li s2, 0
    
print_row_loop:
    li t4, 0
    
print_col_loop:
    addi sp, sp, -4
    sw t4, 0(sp)
    
    mv a0, t4
    mv a1, s2
    jal get_cell_char
    
    li a7, 11
    ecall
    
    lw t4, 0(sp)
    addi sp, sp, 4
    
    addi t4, t4, 1
    blt t4, s0, print_col_loop
    
    li a0, 10
    li a7, 11
    ecall
    
    addi s2, s2, 1
    blt s2, s1, print_row_loop
    
    li a0, 10
    li a7, 11
    ecall
    
    lw s2, 12(sp)
    lw s1, 8(sp)
    lw s0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 16
    ret

# ========================================
# GET_INPUT: Read one character from user
# Output: a0 = character read
# ========================================
get_input:
    li a7, 12
    ecall
    ret

# ========================================
# GET_INTEGER: Read an integer from user
# Output: a0 = integer read
# ========================================
get_integer:
    li a7, 5
    ecall
    ret

# ========================================
# RESPAWN_SHADOW: Move shadow to new random location
# ========================================
respawn_shadow:
    addi sp, sp, -28
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    sw s2, 12(sp)
    sw s3, 16(sp)
    sw s4, 20(sp)
    sw s5, 24(sp)
    
gen_new_shadow:
    la t0, gridsize
    lb s5, 0(t0)
    lb t6, 1(t0)
    
    addi s5, s5, -2
    mv a0, s5
    jal rand
    addi s0, a0, 1
    
    la t0, gridsize
    lb t6, 1(t0)
    addi t6, t6, -2
    mv a0, t6
    jal rand
    addi s1, a0, 1
    
    la t0, character
    lb s2, 0(t0)
    lb s3, 1(t0)
    
    sub s4, s0, s2
    bgez s4, respawn_abs_x_done
    sub s4, zero, s4
respawn_abs_x_done:
    
    sub t6, s1, s3
    bgez t6, respawn_abs_y_done
    sub t6, zero, t6
respawn_abs_y_done:
    
    add s4, s4, t6
    li t6, 2
    ble s4, t6, gen_new_shadow
    
    la t0, match
    lb t3, 0(t0)
    lb t4, 1(t0)
    bne s0, t3, check_respawn_candle
    beq s1, t4, gen_new_shadow
    
check_respawn_candle:
    la t0, candle
    lb t3, 0(t0)
    lb t4, 1(t0)
    bne s0, t3, shadow_pos_ok
    beq s1, t4, gen_new_shadow
    
shadow_pos_ok:
    la t0, shadowMonster
    sb s0, 0(t0)
    sb s1, 1(t0)
    
    lw s5, 24(sp)
    lw s4, 20(sp)
    lw s3, 16(sp)
    lw s2, 12(sp)
    lw s1, 8(sp)
    lw s0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 28
    ret

# ========================================
# CHECK_SHADOW_PROXIMITY: Check if shadow is adjacent
# ========================================
check_shadow_proximity:
    addi sp, sp, -24
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    sw s2, 12(sp)
    sw s3, 16(sp)
    sw s4, 20(sp)
    
    la t0, character
    lb s0, 0(t0)
    lb s1, 1(t0)
    
    la t0, shadowMonster
    lb s2, 0(t0)
    lb s3, 1(t0)
    
    sub s4, s0, s2
    bgez s4, abs_x_done
    sub s4, zero, s4
abs_x_done:
    
    sub t6, s1, s3
    bgez t6, abs_y_done
    sub t6, zero, t6
abs_y_done:
    
    # Check if both |dx| <= 1 AND |dy| <= 1 (Chebyshev distance)
    li t5, 1
    bgt s4, t5, not_adjacent    # if |dx| > 1, not adjacent
    bgt t6, t5, not_adjacent    # if |dy| > 1, not adjacent
    
    # Both are <= 1, so shadow is adjacent (including diagonals)
    # Trigger fear increase
    la t0, fearFactor
    lb t1, 0(t0)
    addi t1, t1, 10
    sb t1, 0(t0)
    
    la a0, msg_fear
    li a7, 4
    ecall
    
    la t0, fearFactor
    lb a0, 0(t0)
    li a7, 1
    ecall
    
    la a0, newline
    li a7, 4
    ecall
    
    jal respawn_shadow

not_adjacent:
    lw s4, 20(sp)
    lw s3, 16(sp)
    lw s2, 12(sp)
    lw s1, 8(sp)
    lw s0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 24
    ret

# ========================================
# MOVE_SHADOW: Move shadow monster towards character
# ========================================
move_shadow:
    addi sp, sp, -20
    sw t0, 0(sp)
    sw t1, 4(sp)
    sw t2, 8(sp)
    sw t3, 12(sp)
    sw t4, 16(sp)
    
    la t0, character
    lb t1, 0(t0)
    lb t2, 1(t0)
    
    la t0, shadowMonster
    lb t3, 0(t0)
    lb t4, 1(t0)
    
    blt t3, t1, shadow_right
    bgt t3, t1, shadow_left
    j shadow_move_y

shadow_right:
    addi t3, t3, 1
    j shadow_update

shadow_left:
    addi t3, t3, -1
    j shadow_update

shadow_move_y:
    blt t4, t2, shadow_down
    bgt t4, t2, shadow_up
    j shadow_update

shadow_down:
    addi t4, t4, 1
    j shadow_update

shadow_up:
    addi t4, t4, -1

shadow_update:
    la t0, shadowMonster
    sb t3, 0(t0)
    sb t4, 1(t0)
    
    lw t4, 16(sp)
    lw t3, 12(sp)
    lw t2, 8(sp)
    lw t1, 4(sp)
    lw t0, 0(sp)
    addi sp, sp, 20
    ret

# ========================================
# CHECK_CANDLE_INTERACTION: Check if character lights candle
# ========================================
check_candle_interaction:
    addi sp, sp, -24
    sw ra, 0(sp)
    sw t0, 4(sp)
    sw t1, 8(sp)
    sw t2, 12(sp)
    sw t3, 16(sp)
    sw t4, 20(sp)
    
    la t0, character
    lb t1, 0(t0)
    lb t2, 1(t0)
    
    la t0, candle
    lb t3, 0(t0)
    lb t4, 1(t0)
    
    bne t1, t3, no_candle_interaction
    bne t2, t4, no_candle_interaction
    
    la t0, hasMatch
    lb t5, 0(t0)
    beqz t5, no_match_for_candle
    
    la t0, candleLit
    li t5, 1
    sb t5, 0(t0)
    j no_candle_interaction

no_match_for_candle:
    la a0, msg_need_match
    li a7, 4
    ecall

no_candle_interaction:
    lw t4, 20(sp)
    lw t3, 16(sp)
    lw t2, 12(sp)
    lw t1, 8(sp)
    lw t0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 24
    ret

# ========================================
# CHECK_MATCH_PICKUP: Check if character picked up match
# ========================================
check_match_pickup:
    addi sp, sp, -24
    sw ra, 0(sp)
    sw t0, 4(sp)
    sw t1, 8(sp)
    sw t2, 12(sp)
    sw t3, 16(sp)
    sw t4, 20(sp)
    
    la t0, character
    lb t1, 0(t0)
    lb t2, 1(t0)
    
    la t0, match
    lb t3, 0(t0)
    lb t4, 1(t0)
    
    bne t1, t3, no_match_pickup
    bne t2, t4, no_match_pickup
    
    la t0, hasMatch
    lb t5, 0(t0)
    bnez t5, no_match_pickup
    
    li t5, 1
    sb t5, 0(t0)
    
    la a0, msg_match_pickup
    li a7, 4
    ecall

no_match_pickup:
    lw t4, 20(sp)
    lw t3, 16(sp)
    lw t2, 12(sp)
    lw t1, 8(sp)
    lw t0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 24
    ret

# ========================================
# MOVE_CHARACTER: Move character and update game state
# Input: a0 = direction character
# ========================================
move_character:
    addi sp, sp, -16
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    sw s2, 12(sp)
    
    jal push_state
    
    mv s0, a0
    
    la t0, character
    lb s1, 0(t0)
    lb s2, 1(t0)
    
    li t0, 119
    beq s0, t0, move_up
    li t0, 115
    beq s0, t0, move_down
    li t0, 97
    beq s0, t0, move_left
    li t0, 100
    beq s0, t0, move_right
    j move_done
    
move_up:
    addi s2, s2, -1
    j check_bounds
move_down:
    addi s2, s2, 1
    j check_bounds
move_left:
    addi s1, s1, -1
    j check_bounds
move_right:
    addi s1, s1, 1
    
check_bounds:
    li t0, 1
    blt s1, t0, invalid_move
    blt s2, t0, invalid_move
    
    la t0, gridsize
    lb t1, 0(t0)
    lb t2, 1(t0)
    
    addi t1, t1, -1
    addi t2, t2, -1
    
    bge s1, t1, invalid_move
    bge s2, t2, invalid_move
    
    la t0, character
    sb s1, 0(t0)
    sb s2, 1(t0)
    
    jal check_match_pickup
    jal check_candle_interaction
    jal move_shadow
    jal check_shadow_proximity
    
    j move_done

invalid_move:
    jal pop_state
    
    la a0, msg_invalid_move
    li a7, 4
    ecall

move_done:
    lw s2, 12(sp)
    lw s1, 8(sp)
    lw s0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 16
    ret

# ========================================
# INIT_GAME: Initialize game state
# ========================================
init_game:
    addi sp, sp, -28
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    sw s2, 12(sp)
    sw s3, 16(sp)
    sw s4, 20(sp)
    sw s5, 24(sp)
    
    jal clear_undo_stack
    
    la t0, fearFactor
    sb zero, 0(t0)
    la t0, hasMatch
    sb zero, 0(t0)
    la t0, candleLit
    sb zero, 0(t0)
    
    la t0, gridsize
    lb s5, 0(t0)
    lb t6, 1(t0)
    
    addi s5, s5, -2
    addi t6, t6, -2
    
    mv a0, s5
    jal rand
    addi s0, a0, 1
    la t0, character
    sb s0, 0(t0)
    
    mv a0, t6
    jal rand
    addi s1, a0, 1
    la t0, character
    sb s1, 1(t0)
    
gen_match:
    mv a0, s5
    jal rand
    addi s2, a0, 1
    
    mv a0, t6
    jal rand
    addi s3, a0, 1
    
    bne s2, s0, check_match_y
    beq s3, s1, gen_match
check_match_y:
    beq s2, s0, gen_match_diff_y
    j store_match
gen_match_diff_y:
    beq s3, s1, gen_match
    
store_match:
    la t0, match
    sb s2, 0(t0)
    sb s3, 1(t0)
    
gen_candle:
    mv a0, s5
    jal rand
    addi t1, a0, 1
    
    mv a0, t6
    jal rand
    addi t2, a0, 1
    
    bne t1, s0, check_candle_match
    beq t2, s1, gen_candle
    
check_candle_match:
    bne t1, s2, store_candle
    beq t2, s3, gen_candle
    
store_candle:
    la t0, candle
    sb t1, 0(t0)
    sb t2, 1(t0)
    
gen_shadow_init:
    mv a0, s5
    jal rand
    addi t1, a0, 1
    
    mv a0, t6
    jal rand
    addi t2, a0, 1
    
    bne t1, s0, check_shadow_match_init
    beq t2, s1, gen_shadow_init
    
check_shadow_match_init:
    bne t1, s2, check_shadow_candle_init
    beq t2, s3, gen_shadow_init
    
check_shadow_candle_init:
    la t0, candle
    lb t3, 0(t0)
    lb t4, 1(t0)
    bne t1, t3, store_shadow_init
    beq t2, t4, gen_shadow_init
    
store_shadow_init:
    la t0, shadowMonster
    sb t1, 0(t0)
    sb t2, 1(t0)
    
    # Save initial positions for map reset
    la t0, init_character
    sb s0, 0(t0)
    sb s1, 1(t0)
    
    la t0, init_match
    sb s2, 0(t0)
    sb s3, 1(t0)
    
    la t0, init_candle
    la t3, candle
    lb t4, 0(t3)
    lb t5, 1(t3)
    sb t4, 0(t0)
    sb t5, 1(t0)
    
    la t0, init_shadow
    la t3, shadowMonster
    lb t4, 0(t3)
    lb t5, 1(t3)
    sb t4, 0(t0)
    sb t5, 1(t0)
    
    lw s5, 24(sp)
    lw s4, 20(sp)
    lw s3, 16(sp)
    lw s2, 12(sp)
    lw s1, 8(sp)
    lw s0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 28
    ret

# ========================================
# RESET_TO_INITIAL_MAP: Reset game to saved initial positions
# ========================================
reset_to_initial_map:
    addi sp, sp, -12
    sw ra, 0(sp)
    sw t0, 4(sp)
    sw t1, 8(sp)
    
    jal clear_undo_stack
    
    # Reset game state flags
    la t0, fearFactor
    sb zero, 0(t0)
    la t0, hasMatch
    sb zero, 0(t0)
    la t0, candleLit
    sb zero, 0(t0)
    
    # Restore character position
    la t0, init_character
    lb t1, 0(t0)
    la t2, character
    sb t1, 0(t2)
    lb t1, 1(t0)
    sb t1, 1(t2)
    
    # Restore match position
    la t0, init_match
    lb t1, 0(t0)
    la t2, match
    sb t1, 0(t2)
    lb t1, 1(t0)
    sb t1, 1(t2)
    
    # Restore candle position
    la t0, init_candle
    lb t1, 0(t0)
    la t2, candle
    sb t1, 0(t2)
    lb t1, 1(t0)
    sb t1, 1(t2)
    
    # Restore shadow position
    la t0, init_shadow
    lb t1, 0(t0)
    la t2, shadowMonster
    sb t1, 0(t2)
    lb t1, 1(t0)
    sb t1, 1(t2)
    
    lw t1, 8(sp)
    lw t0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 12
    ret

# ========================================
# GET_BOARD_SIZE: Prompt user for board dimensions
# ========================================
get_board_size:
    addi sp, sp, -12
    sw ra, 0(sp)
    sw t0, 4(sp)
    sw t1, 8(sp)

get_width:
    la a0, msg_ask_width
    li a7, 4
    ecall
    
    jal get_integer
    mv t0, a0
    
    li t1, 5
    blt t0, t1, invalid_width
    
    la t2, gridsize
    sb t0, 0(t2)
    j get_height

invalid_width:
    la a0, msg_invalid_size
    li a7, 4
    ecall
    j get_width

get_height:
    la a0, msg_ask_height
    li a7, 4
    ecall
    
    jal get_integer
    mv t0, a0
    
    li t1, 5
    blt t0, t1, invalid_height
    
    la t2, gridsize
    sb t0, 1(t2)
    j size_done

invalid_height:
    la a0, msg_invalid_size
    li a7, 4
    ecall
    j get_height

size_done:
    lw t1, 8(sp)
    lw t0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 12
    ret

# ========================================
# GET_NUM_PLAYERS: Prompt user for number of players
# ========================================
get_num_players:
    addi sp, sp, -12
    sw ra, 0(sp)
    sw t0, 4(sp)
    sw t1, 8(sp)

ask_players:
    la a0, msg_ask_players
    li a7, 4
    ecall
    
    jal get_integer
    mv t0, a0
    
    # Validate (minimum 1)
    li t1, 1
    blt t0, t1, invalid_players
    
    # Store number of players
    la t2, num_players
    sw t0, 0(t2)
    j players_done

invalid_players:
    la a0, msg_invalid_players
    li a7, 4
    ecall
    j ask_players

players_done:
    lw t1, 8(sp)
    lw t0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 12
    ret

# ========================================
# INIT_PLAYER_DATA: Allocate and initialize player arrays
# ========================================
init_player_data:
    addi sp, sp, -16
    sw ra, 0(sp)
    sw t0, 4(sp)
    sw t1, 8(sp)
    sw t2, 12(sp)
    
    # Get number of players
    la t0, num_players
    lw t1, 0(t0)
    
    # Allocate memory for player_scores (1 byte per player)
    mv a0, t1
    li a7, 9        # sbrk syscall
    ecall
    la t0, player_scores_ptr
    sw a0, 0(t0)    # Store pointer to scores array
    mv t2, a0       # Keep pointer in t2
    
    # Allocate memory for player_ids (4 bytes per player for word storage)
    la t0, num_players
    lw t1, 0(t0)
    slli a0, t1, 2  # multiply by 4 for word-sized IDs
    li a7, 9
    ecall
    la t0, player_ids_ptr
    sw a0, 0(t0)    # Store pointer to IDs array
    mv t3, a0       # Keep pointer in t3
    
    # Initialize scores to 0 and IDs to their index
    la t0, num_players
    lw t1, 0(t0)
    li t4, 0        # Counter
    
init_loop:
    beq t4, t1, init_done
    
    # Initialize score to 0
    add t5, t2, t4
    sb zero, 0(t5)
    
    # Initialize ID to player number (t4)
    slli t6, t4, 2  # multiply by 4 for word offset
    add t5, t3, t6
    sw t4, 0(t5)
    
    addi t4, t4, 1
    j init_loop
    
init_done:
    lw t2, 12(sp)
    lw t1, 8(sp)
    lw t0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 16
    ret

# ========================================
# SHOW_LEADERBOARD: Display final rankings
# ========================================
show_leaderboard:
    addi sp, sp, -32
    sw ra, 0(sp)
    sw s0, 4(sp)
    sw s1, 8(sp)
    sw s2, 12(sp)
    sw s3, 16(sp)
    sw s4, 20(sp)
    sw s5, 24(sp)
    sw s6, 28(sp)
    
    # Print leaderboard header
    la a0, msg_leaderboard
    li a7, 4
    ecall
    
    # Get pointers and player count
    la s0, num_players
    lw s0, 0(s0)        # s0 = num_players
    la t0, player_scores_ptr
    lw s5, 0(t0)        # s5 = player_scores array pointer
    la t0, player_ids_ptr
    lw s6, 0(t0)        # s6 = player_ids array pointer
    
    # Bubble sort players by fear (ascending), keeping IDs paired
    li s1, 0            # s1 = i (outer loop)
    
outer_loop:
    addi s2, s0, -1     # s2 = num_players - 1
    bge s1, s2, sort_done
    
    li s3, 0            # s3 = j (inner loop)
    sub s4, s0, s1      # s4 = num_players - i
    addi s4, s4, -1     # s4 = num_players - i - 1
    
inner_loop:
    bge s3, s4, inner_done
    
    # Compare player_scores[j] with player_scores[j+1]
    add t1, s5, s3      # t1 = &player_scores[j]
    lb t2, 0(t1)        # t2 = player_scores[j]
    lb t3, 1(t1)        # t3 = player_scores[j+1]
    
    ble t2, t3, no_swap
    
    # Swap scores
    sb t3, 0(t1)
    sb t2, 1(t1)
    
    # Also swap corresponding player IDs
    slli t4, s3, 2      # t4 = j * 4
    add t5, s6, t4      # t5 = &player_ids[j]
    lw t6, 0(t5)        # t6 = player_ids[j]
    lw t0, 4(t5)        # t0 = player_ids[j+1]
    sw t0, 0(t5)        # player_ids[j] = player_ids[j+1]
    sw t6, 4(t5)        # player_ids[j+1] = temp
    
no_swap:
    addi s3, s3, 1
    j inner_loop
    
inner_done:
    addi s1, s1, 1
    j outer_loop
    
sort_done:
    # Print sorted leaderboard
    li s1, 0            # s1 = rank counter
    
print_ranks:
    bge s1, s0, leaderboard_done
    
    # Print rank number
    la a0, msg_rank
    li a7, 4
    ecall
    
    addi a0, s1, 1      # rank = i + 1
    li a7, 1
    ecall
    
    la a0, msg_rank_player
    li a7, 4
    ecall
    
    # Print original player ID (now sorted)
    slli t0, s1, 2      # t0 = rank * 4
    add t0, s6, t0      # t0 = &player_ids[rank]
    lw a0, 0(t0)        # Load player ID
    addi a0, a0, 1      # Display as 1-indexed
    li a7, 1
    ecall
    
    la a0, msg_rank_fear
    li a7, 4
    ecall
    
    # Print fear score
    add t0, s5, s1      # t0 = &player_scores[rank]
    lb a0, 0(t0)
    li a7, 1
    ecall
    
    addi s1, s1, 1
    j print_ranks
    
leaderboard_done:
    # Check for ties - count how many players have the winning (lowest) score
    lb t0, 0(s5)        # t0 = winning score (lowest fear)
    li t1, 1            # t1 = count of tied players (start at 1)
    li t2, 1            # t2 = index to check
    
count_ties_loop:
    bge t2, s0, ties_counted
    add t3, s5, t2      # t3 = &player_scores[t2]
    lb t4, 0(t3)        # t4 = player_scores[t2]
    bne t4, t0, ties_counted  # If score differs, stop counting
    addi t1, t1, 1      # Increment tie count
    addi t2, t2, 1
    j count_ties_loop
    
ties_counted:
    # t1 now contains the number of tied players
    li t2, 1
    bgt t1, t2, print_tie_message
    
    # No tie - single winner
    la a0, msg_winner
    li a7, 4
    ecall
    
    lw a0, 0(s6)        # player_ids[0] = winner's original ID
    addi a0, a0, 1      # Display as 1-indexed
    li a7, 1
    ecall
    
    la a0, msg_winner_fear
    li a7, 4
    ecall
    
    lb a0, 0(s5)        # player_scores[0] = lowest fear
    li a7, 1
    ecall
    
    la a0, msg_winner_suffix
    li a7, 4
    ecall
    j winner_done
    
print_tie_message:
    # Multiple winners - print tie message
    la a0, msg_tie
    li a7, 4
    ecall
    
    # Print all tied players
    li t2, 0            # t2 = index
print_tied_players:
    bge t2, t1, tie_players_done
    
    # Print player ID
    slli t3, t2, 2      # t3 = index * 4
    add t3, s6, t3      # t3 = &player_ids[index]
    lw a0, 0(t3)        # Load player ID
    addi a0, a0, 1      # Display as 1-indexed
    li a7, 1
    ecall
    
    # Print separator if not last player
    addi t4, t1, -1
    bge t2, t4, skip_separator
    la a0, msg_tie_separator
    li a7, 4
    ecall
    
skip_separator:
    addi t2, t2, 1
    j print_tied_players
    
tie_players_done:
    la a0, msg_tie_fear
    li a7, 4
    ecall
    
    lb a0, 0(s5)        # Print the tied fear score
    li a7, 1
    ecall
    
    la a0, msg_winner_suffix
    li a7, 4
    ecall
    
winner_done:
    lw s6, 28(sp)
    lw s5, 24(sp)
    lw s4, 20(sp)
    lw s3, 16(sp)
    lw s2, 12(sp)
    lw s1, 8(sp)
    lw s0, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 32
    ret

# ========================================
# WAIT_FOR_ENTER: Wait for user to press enter
# ========================================
wait_for_enter:
    addi sp, sp, -4
    sw ra, 0(sp)
    
    la a0, msg_press_enter
    li a7, 4
    ecall
    
    # Read until newline
wait_loop:
    li a7, 12
    ecall
    li t0, 10           # newline
    bne a0, t0, wait_loop
    
    lw ra, 0(sp)
    addi sp, sp, 4
    ret

_start:
    # Initialize the undo stack
    la t0, undo_stack_buffer
    li t1, 4096
    add t0, t0, t1
    la t1, undo_stack_base
    sw t0, 0(t1)
    la t1, undo_stack_ptr
    sw t0, 0(t1)
    
    # Seed the random number generator
    li a7, 30
    ecall
    la t0, seed
    sw a0, 0(t0)

    # Print welcome message
    la a0, msg_welcome
    li a7, 4
    ecall
    
    # Get number of players
    jal get_num_players
    
    # Get board size
    jal get_board_size
    
    # Initialize game map (generates positions once)
    jal init_game
    
    # Initialize player data
    jal init_player_data
    
    # Main multiplayer loop
    addi sp, sp, -12
    sw ra, 0(sp)
    sw s2, 4(sp)
    sw s3, 8(sp)
    
    # Set current player to 0
    la t0, current_player
    sw zero, 0(t0)

player_turn_start:
    # Check if all players have finished
    la t0, current_player
    lw t1, 0(t0)
    la t2, num_players
    lw t2, 0(t2)
    bge t1, t2, all_players_done
    
    # Reset map to initial state for this player
    jal reset_to_initial_map
    
    # Print player turn message
    la a0, msg_player_turn
    li a7, 4
    ecall
    
    la t0, current_player
    lw a0, 0(t0)
    addi a0, a0, 1      # Display as 1-indexed
    li a7, 1
    ecall
    
    la a0, msg_turn_suffix
    li a7, 4
    ecall
    
game_loop:
    jal print_board
    
    # Check win condition
    la t0, candleLit
    lb t1, 0(t0)
    bnez t1, game_won
    
    # Check lose condition
    la t0, fearFactor
    lb t1, 0(t0)
    li t2, 100
    bge t1, t2, game_lost
    
    la a0, msg_input_prompt
    li a7, 4
    ecall
    
    jal get_input
    mv s3, a0
    
    la a0, newline
    li a7, 4
    ecall
    
    mv a0, s3
    li t0, 113  # 'q'
    beq a0, t0, exit
    
    li t0, 114  # 'r'
    beq a0, t0, restart_turn
    
    li t0, 117  # 'u'
    beq a0, t0, undo_move
    
    # Check if valid movement key
    li t0, 119  # 'w'
    beq a0, t0, valid_input
    li t0, 97   # 'a'
    beq a0, t0, valid_input
    li t0, 115  # 's'
    beq a0, t0, valid_input
    li t0, 100  # 'd'
    beq a0, t0, valid_input
    
    la a0, msg_invalid_input
    li a7, 4
    ecall
    j game_loop
    
valid_input:
    mv a0, s3
    jal move_character
    j game_loop

undo_move:
    jal pop_state
    beqz a0, undo_failed
    
    la a0, msg_undo_success
    li a7, 4
    ecall
    j game_loop
    
undo_failed:
    la a0, msg_undo_empty
    li a7, 4
    ecall
    j game_loop

restart_turn:
    la a0, msg_restart
    li a7, 4
    ecall
    j player_turn_start

game_won:
    la a0, msg_candle_lit
    li a7, 4
    ecall
    j record_score

game_lost:
    la a0, msg_game_over
    li a7, 4
    ecall
    j record_score

record_score:
    # Save current player's final fear
    la t0, current_player
    lw t1, 0(t0)
    la t2, player_scores_ptr
    lw t2, 0(t2)        # Get scores array pointer
    add t2, t2, t1      # Add offset
    la t3, fearFactor
    lb t4, 0(t3)
    sb t4, 0(t2)
    
    # Print player finished message
    la a0, msg_player_finished
    li a7, 4
    ecall
    
    la t0, current_player
    lw a0, 0(t0)
    addi a0, a0, 1
    li a7, 1
    ecall
    
    la a0, msg_finished_fear
    li a7, 4
    ecall
    
    la t0, current_player
    lw t1, 0(t0)
    la t2, player_scores_ptr
    lw t2, 0(t2)
    add t2, t2, t1
    lb a0, 0(t2)
    li a7, 1
    ecall
    
    la a0, newline
    li a7, 4
    ecall
    
    # Move to next player
    la t0, current_player
    lw t1, 0(t0)
    addi t1, t1, 1
    sw t1, 0(t0)
    
    # Check if more players remain
    la t2, num_players
    lw t2, 0(t2)
    bge t1, t2, all_players_done
    
    # Wait for next player
    jal wait_for_enter
    j player_turn_start

all_players_done:
    # Show final leaderboard
    jal show_leaderboard
    
    lw s3, 8(sp)
    lw s2, 4(sp)
    lw ra, 0(sp)
    addi sp, sp, 12
    j exit

exit:
    la a0, msg_goodbye
    li a7, 4
    ecall

    li a7, 10
    ecall