package storage;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class ScoreStorage implements Storage{
    /*
     * stores all save data retrieved from file
     */
    private List<String> saveData;

    /*
     * Formats and saves scores to "scoreSave.txt" file
     */
    @Override
    public void save(List<String> gameInfo) {
        File myObj = new File("scoreSave.txt");
        try {
            myObj.createNewFile();
            FileWriter myWriter = new FileWriter("scoreSave.txt", true);
            myWriter.write(gameInfo.get(0) + " > " + gameInfo.get(1) + " > " + gameInfo.get(2) + " > " +
                    gameInfo.get(3) + " > " + gameInfo.get(4) + "\n");
            myWriter.close();
            System.out.println("Successfully Saved Score!");
        } catch (IOException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
        }
    }

    /*
     * Retrieves and assigns data from "scoreSave.txt" file to saveData attribute
     */
    @Override
    public void retrieve(int display){
        try {
            System.out.println("+++++++++++++ Player Performance Overtime +++++++++++++");
            File myObj = new File("scoreSave.txt");
            Scanner myReader = new Scanner(myObj);

            // Retrieves and displays data from file line by line
            while (myReader.hasNextLine()){
                this.saveData = Arrays.asList(myReader.nextLine().replace("\n", "").split(" > "));
                display();
            }

            myReader.close();
            System.out.println("++++++++++++++++++++ End Of Report ++++++++++++++++++++");
        } catch (FileNotFoundException e) {System.out.println("An error occurred."); e.printStackTrace();}
    }

    /*
     * Nicely formats and displays a round's data
     */
    @Override
    public void display(){
        System.out.println("Round #: " + this.saveData.get(4));
        System.out.println("Player Found Words: " + this.saveData.get(0));
        System.out.println("Computer Found Words: " + this.saveData.get(1));
        System.out.println("Number Of Words (Player): " + this.saveData.get(0).split(",").length);
        System.out.println("Number Of Words (Computer): " + this.saveData.get(1).split(",").length);
        System.out.println("Player Score: " + this.saveData.get(2));
        System.out.println("Computer Score: " + this.saveData.get(3));
        System.out.println("-------------------------------------------------------------");
    }

    /*
     * @Returns List<String> SaveData attribute
     */
    @Override
    public List<String> getSaveData(){return this.saveData;}
}
