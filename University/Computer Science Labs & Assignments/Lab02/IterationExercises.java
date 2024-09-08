package lab02;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;

public class IterationExercises {

    /**
     * Returns the sum of all odd numbers up to the given integer.
     * Live Long & Prosper
     *
     * @param n	any integer
     * @return the sum of all odd integers up to and including n
     */
    public static int addOdds(int n) {
        if(n==0){return 0;}
        int sum = 0;
        for(int i = 1; i <= n; i += 2){
            sum += i;
        }
        return sum;
    }

    /**
     * Given a string, replaces each digit in the string, that many occurrences of an asterisk character
     * Example: given the String "boole7an", return the String "boole*******an".
     *
     * @param str
     * @return an "asterisked up" string
     */
    public static String asteriskUp(String str) {
        String newString = "";
        for (int i = 0; i < str.length(); i++){
            if (Character.isDigit(str.charAt(i))){
                newString += "*".repeat(Integer.parseInt(String.valueOf(str.charAt(i))));
            } else{newString += str.charAt(i);}
        }
        return newString;
    }

    /**
     * Return the number of characters in String str1 that are also in String str2.
     * Example 1: if str1 is Pizza and str2 is Pepperoni, the function should return 2.
     * Example 2: if str1 is Pepperoni and str2 is Pizza, the function should return 4.
     *
     * @param str1	a String
     * @param str2	a String
     * @return	the number of characters in str1 that occur in str2.
     */
    public static int countCharacters(String str1, String str2) {
        int occurence = 0;
        for (int i =0; i < str1.length(); i++){
            for (int j = 0; j < str2.length(); j++){
                String first = String.valueOf(str1.charAt(i)).toUpperCase();
                String second = String.valueOf(str2.charAt(j)).toUpperCase();
                if (first.equals(second)){
                    occurence++;
                    break;
                }
            }
        }
        return occurence;
    }

    /**
     * Given array arr1 and ArrayList arr2, count the number of elements in arr1
     * that occur arr2
     *
     * @param arr1	an array of elements
     * @param arr2	an ArrayList of elements
     *
     * @return	the number of elements in arr1 that occur in arr2
     */
    public static int inArrayList(int[] arr1, ArrayList<Integer> arr2) {
        int occurence = 0;
        for (int i =0; i < arr1.length; i++){
            for (int j = 0; j < arr2.size(); j++){
                if (arr1[i] == arr2.get(j)){
                    occurence++;
                    break;
                }
            }
        }
        return occurence;
    }

    /**
     * Mutate an ArrayList of Strings such that the value at
     * index a is replaced with the value at index b and vice versa.
     * Do nothing if either index is invalid.
     *
     * @param swapList the list to be mutated
     * @param a	an integer index
     * @param b	an integer index
     *
     */
    public static void swapElements(ArrayList<String> swapList, int a, int b) {
        if (!(a > swapList.size() || b > swapList.size() || a < 0 || b < 0)){
            String store = swapList.get(a);
            swapList.set(b, store);
            swapList.set(a, swapList.get(b));
        }
    }

    /**
     * Return a HashMap that includes unique elements in an array
     * as keys and the number of times they occur in the
     * array as the value.
     *
     * @param arr1	an array of elements
     *
     * @return a hashmap that shows frequency count of elements in given array
     */
    public static HashMap<Integer, Integer> countOccurences(int[] arr1) {
        HashMap<Integer, Integer> occurenceMap = new HashMap<Integer, Integer>();
        for (int i = 0; i < arr1.length; i++){
            if(occurenceMap.containsKey(arr1[i])){
                occurenceMap.replace(arr1[i], occurenceMap.get(arr1[i]) + 1);
            } else{occurenceMap.put(arr1[i], 1);}
        }
        return occurenceMap;
    }

    /**
     * Main method
     *
     * @param args	method arguments, if any
     */
    public static void main(String[] args) {

        try {
            System.out.println(asteriskUp("hell8o"));
        }  catch (Exception e) {
            System.out.println("You have to implement the asteriskUp method!");
            System.exit(1); //0 indicates no error, 1 indicates something went awry
        }

        try {
            System.out.println(countCharacters("Pizza", "Pepperoni"));
        }  catch (Exception e) {
            System.out.println("You have to implement the countCharacters method!");
            System.exit(1); //0 indicates no error, 1 indicates something went awry
        }
        try {
            System.out.println(addOdds(8));
        }  catch (Exception e) {
            System.out.println("You have to implement the addOdds method!");
            System.exit(1); //0 indicates no error, 1 indicates something went awry
        }

        try {
            int[] arr1 = {4, 5, 6, 8};
            ArrayList<Integer> arr2 = new ArrayList<Integer>(Arrays.asList(1, 2, 4, 5, 5, 5));
            System.out.println(inArrayList(arr1, arr2));
        }  catch (Exception e) {
            System.out.println("You have to implement the inArrayList method!");
            System.exit(1); //0 indicates no error, 1 indicates something went awry
        }

        try {
            int[] arr = {1, 2, 3, 4, 1, 1, 3, 3, 3, 5};
            System.out.println(countOccurences(arr));
        } catch (Exception e) {
            System.out.println("You have to implement the countOccurences method!");
            System.exit(1); //0 indicates no error, 1 indicates something went awry
        }

    }

}
