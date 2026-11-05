package storage;

public class StorageCreator {
    /*
     * Determines the type of storage required
     * for saving or retrieving data
     */
    public Storage getStorage(String type){
        if (type.equals("score")){return new ScoreStorage();}
        else {return new GameStorage();}
    }
}
