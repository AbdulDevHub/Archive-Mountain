/**
 * Main class for the first CSC207 lab!
 */
public class Main {
    public static void main(String[] args) {
        try {
            SimpleObject s = new SimpleObject(10);
            System.out.println("This object sums to " + s.sumUp());
        } catch (Exception e) {
            System.out.println("You have to implement the sumUp method first!");
            System.exit(1); //0 indicates no error, 1 indicates something went awry
        }
    }
}

