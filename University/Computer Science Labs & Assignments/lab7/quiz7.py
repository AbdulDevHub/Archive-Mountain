from typing import Union


def semi_homogeneous(obj: Union[int, list]) -> bool:
    """Return whether the given nested list is semi-homogeneous.
    >>> semi_homogeneous(5)
    True
    >>> semi_homogeneous([5, 4, 3, 2, 1])
    True
    >>> semi_homogeneous([[5, 4], [3, 2], [1, 2], [2, 3]])
    True
    >>> semi_homogeneous([[[3, 2], [1, 2]], [[3, 2], [1, 2]]])
    True
    """
    if isinstance(obj, int) or obj == []:
        return True
    else:
        all_ints = True
        all_lists = True
        all_semi = True
        for sub in obj:
            if isinstance(sub, int):
                all_lists = False
            elif isinstance(sub, list):
                all_ints = False
                all_semi = semi_homogeneous(sub)
                if all_semi is False:
                    break
    return (all_ints or all_lists) and all_semi

if __name__ == '__main__':
    import doctest
    doctest.testmod()

    # import python_ta
    # python_ta.check_all()
