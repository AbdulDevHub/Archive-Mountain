package storage;

import java.util.List;

public interface Storage {

    /*
     * Saves inputted data to file
     */
    public void save(List<String> gameInfo);

    /*
     * Retrieves data from file
     */
    public void retrieve(int saveNumber);

    /*
     * Formats and display data to console
     */
    public void display();

    /*
     * @Returns List<String> SaveData attribute
     */
    public List<String> getSaveData();
}
