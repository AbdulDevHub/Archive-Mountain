package treeviz; 

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Read trees from files.
 */
public class TreeReader {
    
    /**
     * Get a list of trees from a csv file
     * 
     * @param filename Name of the file to read
     * @return a list of trees retrieved from the file.
     * @throws IOException if the filename is invalid.
     */
    public static List<MunicipalTree> readTreesFromFile(String filename) throws IOException {
        String line = "";
        boolean flag = false;
        List<MunicipalTree> trees = new ArrayList<>();

        try {
            //parsing a CSV file into BufferedReader class constructor
            BufferedReader br = new BufferedReader(new FileReader(filename));
            while ((line = br.readLine()) != null)   //returns a Boolean value
            {
                if (!flag) { flag = true; continue; } //skip the header row
                String[] record = line.split(","); // use comma as separator
                trees.add(new MunicipalTree(record)); //make a tree from data
            }
            return trees;
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}
