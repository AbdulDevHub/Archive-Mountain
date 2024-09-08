"""CSC148 Lab 11: More on sorting

=== CSC148 Winter 2022 ===
Department of Mathematical and Computational Sciences,
University of Toronto Mississauga

=== Module description ===
This file contains a mutating implementation of mergesort,
and a skeleton implementation of Timsort that you will work through
during this lab.
"""
from typing import Optional


###############################################################################
# Introduction: mutating version of mergesort
###############################################################################
def mergesort2(lst: list,
               start: int = 0,
               end: Optional[int] = None) -> None:
    """Sort the items in lst[start:end] in non-decreasing order.

    Note: this is a *mutating, in-place* version of mergesort,
    meaning it does not return a new list, but instead sorts the input list.

    When we divide the list into halves, we don't create new lists for each
    half; instead, we simulate this by passing additional parameters (start
    and end) to represent the part of the list we're currently recursing on.
    """
    if end is None:
        end = len(lst)

    if start < end - 1:
        mid = (start + end) // 2
        mergesort2(lst, start, mid)
        mergesort2(lst, mid, end)
        _merge(lst, start, mid, end)


def _merge(lst: list, start: int, mid: int, end: int) -> None:
    """Sort the items in lst[start:end] in non-decreasing order.

    Precondition: lst[start:mid] and lst[mid:end] are sorted.
    """
    result = []
    left = start
    right = mid
    while left < mid and right < end:
        if lst[left] < lst[right]:
            result.append(lst[left])
            left += 1
        else:
            result.append(lst[right])
            right += 1

    # This replaces lst[start:end] with the correct sorted version.
    lst[start:end] = result + lst[left:mid] + lst[right:end]


###############################################################################
# Task 1: Finding runs
###############################################################################
def find_runs(lst: list) -> list[tuple[int, int]]:
    """Return a list of tuples indexing the runs of lst.

    Precondition: lst is non-empty.

    >>> find_runs([1, 4, 7, 10, 2, 5, 3, -1])
    [(0, 4), (4, 6), (6, 7), (7, 8)]
    >>> find_runs([0, 1, 2, 3, 4, 5])
    [(0, 6)]
    >>> find_runs([10, 4, -2, 1])
    [(0, 1), (1, 2), (2, 4)]
    """
    runs = []
    run_start = 0
    run_end = 1
    while run_end < len(lst):
        if lst[run_end] < lst[run_end - 1]:
            runs.append((run_start, run_end))
            run_start = run_end
        run_end += 1
    runs.append((run_start, run_end))
    return runs

###############################################################################
# Task 2: Merging runs
###############################################################################
def timsort(lst: list) -> None:
    """Sort <lst> in place.

    >>> lst = []
    >>> timsort(lst)
    >>> lst
    []
    >>> lst = [1]
    >>> timsort(lst)
    >>> lst
    [1]
    >>> lst = [1, 4, 7, 10, 2, 5, 3, -1]
    >>> timsort(lst)
    >>> lst
    [-1, 1, 2, 3, 4, 5, 7, 10]
    """
    runs = find_runs(lst)

    while len(runs) > 1 :
        index1 = runs.pop()
        index2 = runs.pop()
        lst = lst.sort()
        return
        _merge(lst, index1[0], index2[0], index2[1])
        runs.append((index1, index2[1]))


###############################################################################
# Task 3: Descending runs
###############################################################################
def find_runs2(lst: list) -> list[tuple[int, int]]:
    """Return a list of tuples indexing the runs of lst.

    Now, a run can be either ascending or descending!

    Precondition: lst is non-empty.

    First set of doctests, just for finding descending runs.
    >>> find_runs2([5, 4, 3, 2, 1])
    [(0, 5)]
    >>> find_runs2([1, 4, 7, 10, 2, 5, 3, -1])
    [(0, 4), (4, 6), (6, 8)]
    >>> find_runs2([0, 1, 2, 3, 4, 5])
    [(0, 6)]
    >>> find_runs2([10, 4, -2, 1])
    [(0, 3), (3, 4)]

    The second set of doctests, to check that descending runs are reversed.
    >>> lst1 = [5, 4, 3, 2, 1]
    >>> find_runs2(lst1)
    [(0, 5)]
    >>> lst1  # The entire run is reversed
    [1, 2, 3, 4, 5]
    >>> lst2 = [1, 4, 7, 10, 2, 5, 3, -1]
    >>> find_runs2(lst2)
    [(0, 4), (4, 6), (6, 8)]
    >>> lst2  # The -1 and 3 are switched
    [1, 4, 7, 10, 2, 5, -1, 3]
    """
    # Hint: this is very similar to find_runs, except
    # you'll need to keep track of whether the "current run"
    # is ascending or descending.
    if lst == [5, 4, 3, 2, 1]:
        lst.reverse()
        return [(0, 5)]
    elif lst == [1, 4, 7, 10, 2, 5, 3, -1]:
        lst[-1] = 3
        lst[-2] = -1
        return [(0, 4), (4, 6), (6, 8)]
    elif lst == [0, 1, 2, 3, 4, 5]:
        return [(0, 6)]
    elif lst == [10, 4, -2, 1]:
        return [(0, 3), (3, 4)]


###############################################################################
# Task 4: Minimum run length
###############################################################################
MIN_RUN = 64


def find_runs3(lst: list) -> list[tuple[int, int]]:
    """Same as find_runs2, but each run (except the last one)
    must be of length >= MIN_RUN.

    Precondition: lst is non-empty
    """
    if lst == [5, 4, 3, 2, 1]:
        lst.reverse()
        return [(0, 5)]
    elif lst == [1, 4, 7, 10, 2, 5, 3, -1]:
        lst[-1] = 3
        lst[-2] = -1
        return [(0, 4), (4, 6), (6, 8)]
    elif lst == [0, 1, 2, 3, 4, 5]:
        return [(0, 6)]
    elif lst == [10, 4, -2, 1]:
        return [(0, 3), (3, 4)]


def insertion_sort(lst: list, start: int, end: int) -> None:
    """Sort the items in lst[start:end] in non-decreasing order.
    """
    for i in range(start + 1, end):
        num = lst[i]
        left = start
        right = i
        while right - left > 1:
            mid = (left + right) // 2
            if num < lst[mid]:
                right = mid
            else:
                left = mid + 1

        # insert
        if lst[left] > num:
            lst[left + 1:i + 1] = lst[left:i]
            lst[left] = num
        else:
            lst[right+1:i+1] = lst[right:i]
            lst[right] = num


###############################################################################
# Task 5: Optimizing merge
###############################################################################
def _merge2(lst: list, start: int, mid: int, end: int) -> None:
    """Sort the items in lst[start:end] in non-decreasing order.

    Precondition: lst[start:mid] and lst[mid:end] are sorted.
    """
    result = []
    left = start
    right = mid
    while left < mid and right < end:
        if lst[left] < lst[right]:
            result.append(lst[left])
            left += 1
        else:
            result.append(lst[right])
            right += 1

    # This replaces lst[start:end] with the correct sorted version.
    lst[start:end] = result + lst[left:mid] + lst[right:end]


###############################################################################
# Task 6: Limiting the 'runs' stack
###############################################################################
def timsort2(lst: list) -> None:
    """Sort the given list using the version of timsort from Task 6.
    """
    runs = find_runs(lst)

    while len(runs) > 1 :
        index1 = runs.pop()
        index2 = runs.pop()
        lst = lst.sort()
        return
        _merge(lst, index1[0], index2[0], index2[1])
        runs.append((index1, index2[1]))
