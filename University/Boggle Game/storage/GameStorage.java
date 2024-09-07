package storage;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class GameStorage implements Storage{
    /*
     * stores all save data retrieved from file
     */
    private List<String> saveData;

    /*
     * Formats and saves game to "gameSave.txt" file
     */
    @Override
    public void save(List<String> gameInfo){
        File myObj = new File("gameSave.txt");
        try {
            myObj.createNewFile();
            FileWriter myWriter = new FileWriter("gameSave.txt", true);
            myWriter.write("* " + gameInfo.get(0) + " > " +
                    gameInfo.get(1).replace("\n", "").replace(" ", "")
                    + "\n"); myWriter.close();
            System.out.println("Successfully Saved Game!");
        } catch (IOException e){System.out.println("An error occurred."); e.printStackTrace();}
    }

    /*
     * @return int number of games saved to file
     */
    public int numberOfSaves(){
        File myObj = new File("gameSave.txt");
        if(myObj.exists() && !myObj.isDirectory()) {
            try {
                Scanner myReader = new Scanner(myObj);
                int counter = 0;
                while (myReader.hasNextLine()) {myReader.nextLine(); counter++;}
                myReader.close(); return counter;
            } catch (FileNotFoundException e) {System.out.println("An error occurred."); e.printStackTrace();}
        } return 0;
    }

    /*
     * Retrieves and assigns requested saved game data from
     * the "gameSave.txt" file to saveData attribute
     */
    @Override
    public void retrieve(int saveNumber){
        try {
            File myObj = new File("gameSave.txt");
            Scanner myReader = new Scanner(myObj);
            int counter = 1;
            while (myReader.hasNextLine() && counter != saveNumber) {myReader.nextLine(); counter++;}
            String roundSave = myReader.nextLine(); myReader.close();
            this.saveData = Arrays.asList(roundSave.replace("\n", "").substring(2).split(" > "));
        } catch (FileNotFoundException e) {System.out.println("An error occurred."); e.printStackTrace();}
    }

    /*
     * Outputs whether save successfully retrieved
     */
    @Override
    public void display(){
        System.out.println("\nGame Retrieved!");
        System.out.println("Current Found Words: " + saveData.get(0));
        System.out.println("Let's Continue!\n");
    }

    /*
     * @Returns List<String> SaveData attribute
     */
    public List<String> getSaveData(){return this.saveData;}
}
