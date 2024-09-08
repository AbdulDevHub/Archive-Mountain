import lab04.BrailleLetterException;
import lab04.BrailleTranslator;

import java.io.*;
import java.util.Scanner;

public class Main {

    /**
     * Main method of the program.
     *
     * @param args command-line arguments (not used)
     */
    public static void main(String[] args) {
        String filename = "input.txt";
        String line = "";
        BrailleTranslator bt = null;
        try {
            bt = new BrailleTranslator();
        } catch (IOException e) {
            System.out.println("IO Exception: " + e.getMessage());
            System.exit(1); //something went awry!
        }

        try {
            File myObj = new File(filename);
            Scanner myReader = new Scanner(myObj);
            while (myReader.hasNextLine()) {
                line = myReader.nextLine();
                bt.translateLine(line);
            }
            myReader.close();
        } catch (FileNotFoundException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        } catch (BrailleLetterException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        }

        //write your code to read in the file in filename
        //and to translate it to Braille using the BrailleTranslator here.
        //
        //Your code will include references to the method 'bt.translateLine'!
        //You will want to read in each line of the input file,
        //and translate each line to Braille accordingly.
        //Make sure to handle BrailleLetterExceptions appropriately.

        //when your code is complete, this call should print a Braille translation of the input.
        System.out.println(bt);
    }



}
