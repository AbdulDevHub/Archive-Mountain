"""CSC148 Prep 4: Abstract Data Types

=== CSC148 Winter 2022 ===
Department of Mathematical and Computational Sciences,
University of Toronto Mississauga

=== Module description ===
This module contains sample tests for Prep 4.

WARNING: THIS IS AN EXTREMELY INCOMPLETE SET OF TESTS!
Add your own to practice writing tests and to be confident your code is correct.

For more information on hypothesis (one of the testing libraries we're using),
please see
<https://mcs.utm.utoronto.ca/~148/software/hypothesis.html>.

Note: this file is for support purposes only, and is not part of your
submission.
"""

from hypothesis import given
from hypothesis.strategies import integers, lists

from adts import Stack, Queue
from prep4 import peek, reverse_top_two, remove_all, remove_all_but_one


def test_peek_doctest() -> None:
    """This is the doctest given in peek."""
    stack = Stack()
    stack.push(1)
    stack.push(2)
    assert peek(stack) == 2
    assert stack.pop() == 2


def test_peek_empty() -> None:
    """This is the doctest given in peek."""
    stack = Stack()
    assert peek(stack) == None


@given(lists(integers(), min_size=1, max_size=100))
def test_peek_general(items: list[int]) -> None:
    """Test that peek works for a large range of stack sizes."""
    stack = Stack()
    for item in items:
        stack.push(item)
    assert peek(stack) == items[-1]
    assert stack.pop() == items[-1]


def test_reverse_top_two_doctest() -> None:
    """This is the doctest given in reverse_top_two."""
    stack = Stack()
    stack.push(1)
    stack.push(2)
    reverse_top_two(stack)
    assert stack.pop() == 1
    assert stack.pop() == 2
    assert stack.is_empty()


@given(lists(integers(), min_size=2, max_size=100))
def test_reverse_top_two_general(items: list[int]) -> None:
    """This is the doctest given in reverse_top_two."""
    stack = Stack()
    for item in items:
        stack.push(item)
    reverse_top_two(stack)
    assert stack.pop() == items[-2]
    assert stack.pop() == items[-1]


def test_remove_all_doctest() -> None:
    """This is the doctest given in remove_all."""
    queue = Queue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    remove_all(queue)
    assert queue.is_empty()


@given(lists(integers(), min_size=1, max_size=100))
def test_remove_all_general(items: list[int]) -> None:
    """This is the doctest given in remove_all."""
    queue = Queue()
    for item in items:
        queue.enqueue(item)
    remove_all(queue)
    assert queue.is_empty()


def test_remove_all_but_one_doctest() -> None:
    """Test is the doctest given in remove_all_but_one."""
    queue = Queue()
    queue.enqueue(1)
    queue.enqueue(2)
    queue.enqueue(3)
    remove_all_but_one(queue)
    assert queue.is_empty() is False
    assert queue.dequeue() == 3
    assert queue.is_empty()


@given(lists(integers(), min_size=1, max_size=100))
def test_remove_all_general(items: list[int]) -> None:
    """This is the doctest given in remove_all."""
    queue = Queue()
    for item in items:
        queue.enqueue(item)
    remove_all_but_one(queue)
    assert queue.is_empty() is False
    assert queue.dequeue() == item[0]
    assert queue.is_empty()


def test_remove_all_general() -> None:
    """This is the doctest given in remove_all."""
    queue = Queue()
    queue.enqueue(1)
    remove_all_but_one(queue)
    assert queue.is_empty() is False
    assert queue.dequeue() == 1
    assert queue.is_empty()


if __name__ == '__main__':
    import pytest

    pytest.main(['prep4_sample_test.py'])
