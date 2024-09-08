package lab02;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

class IterationExercisesTest {

    @Test
    void addOddsTest() {
        int result = IterationExercises.addOdds(8);
        assertEquals(result, 16);
    }

    @Test
    void addOddsTest1() {
        int result = IterationExercises.addOdds(9);
        assertEquals(result, 25);
    }

    @Test
    void addOddsTest2() {
        int result = IterationExercises.addOdds(1);
        assertEquals(result, 1);
    }

    @Test
    void addOddsTest3() {
        int result = IterationExercises.addOdds(3);
        assertEquals(result, 4);
    }

    @Test
    void addOddsTest4() {
        int result = IterationExercises.addOdds(0);
        assertEquals(result, 0);
    }

    @Test
    void asteriskUpTest() {
        String result = IterationExercises.asteriskUp("hell8o");
        assertEquals(result, "hell********o");
    }

    @Test
    void asteriskUpTest1() {
        String result = IterationExercises.asteriskUp("hell0o");
        assertEquals(result, "hello");
    }

    @Test
    void asteriskUpTest2() {
        String result = IterationExercises.asteriskUp("hell1o");
        assertEquals(result, "hell*o");
    }

    @Test
    void asteriskUpTest3() {
        String result = IterationExercises.asteriskUp("hello");
        assertEquals(result, "hello");
    }


    @Test
    void countCharactersTest() {
        String str1 = "Pizza";
        String str2 = "Pepperoni";
        int result =  IterationExercises.countCharacters(str1, str2);
        assertEquals(result, 2);
    }

    @Test
    void countCharactersTest1() {
        String str2 = "Pizza";
        String str1 = "Pepperoni";
        int result =  IterationExercises.countCharacters(str1, str2);
        assertEquals(result, 4);
    }

    @Test
    void countCharactersTest2() {
        String str2 = "";
        String str1 = "Pepperoni";
        int result =  IterationExercises.countCharacters(str1, str2);
        assertEquals(result, 0);
    }

    @Test
    void inArrayListTest() {
        int[] arr1 = {4, 5, 6, 8};
        ArrayList<Integer> arr2 = new ArrayList<Integer>(Arrays.asList(1, 2, 4, 5, 5, 5));
        int result = IterationExercises.inArrayList(arr1,arr2);
        assertEquals(result, 2);
    }

    @Test
    void inArrayListTest1() {
        int[] arr1 = {2, 2, 2, 2};
        ArrayList<Integer> arr2 = new ArrayList<Integer>(Arrays.asList(2));
        int result = IterationExercises.inArrayList(arr1,arr2);
        assertEquals(result, 4);
    }

    @Test
    void inArrayListTest2() {
        int[] arr1 = {2, 2, 2, 2};
        ArrayList<Integer> arr2 = new ArrayList<Integer>(Arrays.asList());
        int result = IterationExercises.inArrayList(arr1,arr2);
        assertEquals(result, 0);
    }

    @Test
    void inArrayListTest3() {
        int[] arr1 = {};
        ArrayList<Integer> arr2 = new ArrayList<Integer>(Arrays.asList(2));
        int result = IterationExercises.inArrayList(arr1,arr2);
        assertEquals(result, 0);
    }


    @Test
    void countOccurrences() {
        HashMap<Integer, Integer> testHash = new HashMap<Integer, Integer>();
        testHash.put(1,3);
        testHash.put(2,1);
        testHash.put(3,4);
        testHash.put(4,1);
        testHash.put(5,1);
        int[] arr = {1, 2, 3, 4, 1, 1, 3, 3, 3, 5};
        HashMap<Integer, Integer> result = IterationExercises.countOccurences(arr);
        for (Integer k: testHash.keySet()){
            Integer v = result.get(k);
            assertEquals(v, testHash.get(k));
        }
    }

    @Test
    void countOccurrences2() {
        HashMap<Integer, Integer> testHash = new HashMap<Integer, Integer>();
        int[] arr = {};
        HashMap<Integer, Integer> result = IterationExercises.countOccurences(arr);
        for (Integer k: testHash.keySet()){
            Integer v = result.get(k);
            assertEquals(v, testHash.get(k));
        }
    }

    //Make sure to write your own tests
    //Remember edge and corner cases!
}
