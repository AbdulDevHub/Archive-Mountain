'''
CSC263 Winter 2026
Problem Set 1 Starter Code
University of Toronto Mississauga
'''

# Do NOT add any import statements

def kmins(commands):
    '''
    Pre: commands is a list of commands
    Post: return list of kmin results
    '''
    
    # =========================
    # AVL Tree Node Definition
    # =========================
    class AVLNode:
        def __init__(self, value):
            self.value = value
            self.left = None
            self.right = None
            self.height = 1   # height of subtree rooted here
            self.size = 1     # number of nodes in subtree rooted here
    
    # =========================
    # Helper Functions
    # =========================
    def get_height(node):
        return node.height if node else 0
    
    def get_size(node):
        return node.size if node else 0
    
    def update_node(node):
        if node:
            node.height = 1 + max(get_height(node.left), get_height(node.right))
            node.size = 1 + get_size(node.left) + get_size(node.right)
    
    def get_balance_factor(node):
        return get_height(node.right) - get_height(node.left) if node else 0
    
    # =========================
    # Rotations
    # =========================
    def rotate_right(y):
        x = y.left
        T2 = x.right
        
        x.right = y
        y.left = T2
        
        update_node(y)
        update_node(x)
        
        return x
    
    def rotate_left(x):
        y = x.right
        T2 = y.left
        
        y.left = x
        x.right = T2
        
        update_node(x)
        update_node(y)
        
        return y
    
    # =========================
    # AVL Insert
    # =========================
    def insert(root, value):
        if not root:
            return AVLNode(value)
        
        if value < root.value:
            root.left = insert(root.left, value)
        else:
            root.right = insert(root.right, value)
        
        update_node(root)
        
        balance = get_balance_factor(root)
        
        # Right-Right case
        if balance > 1 and value >= root.right.value:
            return rotate_left(root)
        
        # Left-Left case
        if balance < -1 and value < root.left.value:
            return rotate_right(root)
        
        # Right-Left case
        if balance > 1 and value < root.right.value:
            root.right = rotate_right(root.right)
            return rotate_left(root)
        
        # Left-Right case
        if balance < -1 and value >= root.left.value:
            root.left = rotate_left(root.left)
            return rotate_right(root)
        
        return root
    
    # =========================
    # k-th Smallest Query
    # =========================
    def find_kth_smallest(node, k):
        if not node:
            return None
        
        left_size = get_size(node.left)
        
        if k == left_size + 1:
            return node.value
        elif k <= left_size:
            return find_kth_smallest(node.left, k)
        else:
            return find_kth_smallest(node.right, k - left_size - 1)
    
    # =========================
    # Process Commands
    # =========================
    root = None
    kmin_count = 0
    results = []
    
    for command in commands:
        if command.startswith('insert'):
            value = int(command.split()[1])
            root = insert(root, value)
        elif command == 'kmin':
            kmin_count += 1
            results.append(find_kth_smallest(root, kmin_count))
    
    return results

if __name__ == '__main__':

    # some small test cases
    # Case 1
    assert [10, 5, 10] == kmins(
        ['insert 10',
         'kmin',
         'insert 5',
         'insert 2',
         'insert 50',
         'kmin',
         'kmin',
         'insert -5'
        ])
    
    # Additional test from problem description
    assert [3, 9, 9, 12] == kmins(
        ["insert 9", "insert 3", "kmin", "kmin", "insert 1", "insert 12", "kmin", "kmin"]
    )
    
    print("All tests passed!")