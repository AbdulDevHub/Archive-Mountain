package boggle;

import storage.GameStorage;
import storage.Storage;
import storage.StorageCreator;

import java.util.*;

/**
 * The BoggleGame class for the first Assignment in CSC207, Fall 2022
 */
public class BoggleGame {

    /**
     * scanner used to interact with the user via console
     */ 
    public Scanner scanner; 
    /**
     * stores game statistics
     */ 
    private BoggleStats gameStats;
    /**
     * dice used to randomize letter assignments for a small grid
     */ 
    private final String[] dice_small_grid= //dice specifications, for small and large grids
            {"AAEEGN", "ABBJOO", "ACHOPS", "AFFKPS", "AOOTTW", "CIMOTU", "DEILRX", "DELRVY",
                    "DISTTY", "EEGHNW", "EEINSU", "EHRTVW", "EIOSST", "ELRTTY", "HIMNQU", "HLNNRZ"};
    /**
     * dice used to randomize letter assignments for a big grid
     */ 
    private final String[] dice_big_grid =
            {"AAAFRS", "AAEEEE", "AAFIRS", "ADENNN", "AEEEEM", "AEEGMU", "AEGMNN", "AFIRSY",
                    "BJKQXZ", "CCNSTW", "CEIILT", "CEILPT", "CEIPST", "DDLNOR", "DDHNOT", "DHHLOR",
                    "DHLNOR", "EIIITT", "EMOTTT", "ENSSSU", "FIPRSY", "GORRVW", "HIPRRY", "NOOTUW", "OOOTTU"};


    /**
     * A linked list of players
     *
     * Represents the current player as well.
     */

    public Player playerList;

    public int numPlayers;




    /* 
     * BoggleGame constructor
     */
    public BoggleGame() {
        this.scanner = new Scanner(System.in);
        this.gameStats = new BoggleStats(this);
    }

    /* 
     * Provide instructions to the user, so they know how to play the game.
     */
    public void giveInstructions()
    {
        System.out.println("The Boggle board contains a grid of letters that are randomly placed.");
        System.out.println("We're both going to try to find words in this grid by joining the letters.");
        System.out.println("You can form a word by connecting adjoining letters on the grid.");
        System.out.println("Two letters adjoin if they are next to each other horizontally, ");
        System.out.println("vertically, or diagonally. The words you find must be at least 4 letters long, ");
        System.out.println("and you can't use a letter twice in any single word. Your points ");
        System.out.println("will be based on word length: a 4-letter word is worth 1 point, 5-letter");
        System.out.println("words earn 2 points, and so on. After you find as many words as you can,");
        System.out.println("I will find all the remaining words.");
        System.out.println("\nHit return when you're ready...");
    }


    /* 
     * Gets information from the user to initialize a new Boggle game.
     * It will loop until the user indicates they are done playing.
     */
    public void playGame(){
        int boardSize = 0;
        //get player count
        System.out.println("Enter the number of players you wish to play with.");
        String choicePlayers = scanner.nextLine();

        if(choicePlayers == "") return; //end game if user inputs nothing
        boolean playerNumValid = false;
        while(!playerNumValid){
            try{
                Integer playerNum = Integer.parseInt(choicePlayers);
                playerNumValid = true;
            }
            catch (NumberFormatException e) {
                System.out.println("Please try again.");
                System.out.println("Enter the number of players you wish to play with.");
                choicePlayers = scanner.nextLine();
            }
        }

        Integer playerNum = Integer.parseInt(choicePlayers);
        this.numPlayers = playerNum;
        this.playerList =  Player.generatePlayers(playerNum);


        while(true){
            System.out.println("Enter 1 to play on a big (5x5) grid; Enter 2 to play on a small (4x4) one; " +
                    "Enter 3 to continue from a saved singleplayer game: ");
            String choiceGrid = scanner.nextLine();

            Storage game = new StorageCreator().getStorage("game");
            int numberOfSaves = ((GameStorage)game).numberOfSaves();

            //get grid size preference
            if(choiceGrid == "") break; //end game if user inputs nothing
            while((!choiceGrid.equals("1") && !choiceGrid.equals("2") && !choiceGrid.equals("3")) ||
                    (choiceGrid.equals("3") && (numberOfSaves == 0 || this.numPlayers != 1))){
                if (choiceGrid.equals("3") && (numberOfSaves == 0 || this.numPlayers != 1)){System.out.println("You have 0 saved games, try again...");}
                else {System.out.println("Please try again.");}
                System.out.println("Enter 1 to play on a big (5x5) grid; Enter 2 to play on a small (4x4) one; " +
                        "Enter 3 to continue from a saved singleplayer game: ");
                choiceGrid = scanner.nextLine();
            }

            if(choiceGrid.equals("1")) boardSize = 5;
            else if (choiceGrid.equals("2")) boardSize = 4;
            else {
                String userOutput = "There are " + numberOfSaves + " saved games, pick which game you want [Enter" +
                        " 1 - " + numberOfSaves + "]: ";
                System.out.println(userOutput);
                int choiceGame = Integer.parseInt(scanner.nextLine());
                while (choiceGame > numberOfSaves || choiceGame <= 0){
                    System.out.println("Please try again." + "\n" + userOutput);
                    choiceGame = Integer.parseInt(scanner.nextLine());
                }
                game.retrieve(choiceGame); game.display(); boardSize = (int)Math.sqrt(game.getSaveData().get(1).length());
            }

            if (!choiceGrid.equals("3")) {
                //get letter choice preference
                System.out.println("Enter 1 to randomly assign letters to the grid; 2 to provide your own.");
                String choiceLetters = scanner.nextLine();

                if (choiceLetters == "") break; //end game if user inputs nothing
                while (!choiceLetters.equals("1") && !choiceLetters.equals("2")) {
                    System.out.println("Please try again.");
                    System.out.println("Enter 1 to randomly assign letters to the grid; 2 to provide your own.");
                    choiceLetters = scanner.nextLine();
                }

                if (choiceLetters.equals("1")) {
                    playRound(boardSize, randomizeLetters(boardSize));
                } else {
                    System.out.println("Input a list of " + boardSize * boardSize + " letters:");
                    choiceLetters = scanner.nextLine();
                    while (!(choiceLetters.length() == boardSize * boardSize)) {
                        System.out.println("Sorry, bad input. Please try again.");
                        System.out.println("Input a list of " + boardSize * boardSize + " letters:");
                        choiceLetters = scanner.nextLine();
                    }
                    playRound(boardSize, choiceLetters.toUpperCase());
                }
            } else{
                gameStats.setPlayerWords(new HashSet<String>(Arrays.asList(game.getSaveData().get(0).split(", "))));
                playRound(boardSize, game.getSaveData().get(1));
            }

            //round is over! So, store the statistics, and end the round.
            this.gameStats.summarizeRound();
            ((new StorageCreator()).getStorage("score")).save(Arrays.asList(gameStats.getPlayerWords().toString(),
                    gameStats.getComputerWords().toString(), Integer.toString(gameStats.getScore()),
                    Integer.toString(gameStats.getCScore()), Integer.toString(gameStats.getRound() + 1)));
            this.gameStats.endRound();

            //Shall we repeat?
            System.out.println("Play again? Type 'Y' or 'N'");
            String choiceRepeat = scanner.nextLine().toUpperCase();

            if(choiceRepeat == "") break; //end game if user inputs nothing
            while(!choiceRepeat.equals("Y") && !choiceRepeat.equals("N")){
                System.out.println("Please try again.");
                System.out.println("Play again? Type 'Y' or 'N'");
                choiceRepeat = scanner.nextLine().toUpperCase();
            }

            //Display prior performance
            if(choiceRepeat == "" || choiceRepeat.equals("N")) System.out.println("Would You like to look at your prior" +
                    " performance before the game ends? Type 'Y' or 'N': ");
            else System.out.println("Would You like to look at your prior performance before the next match? Type 'Y' or 'N': ");
            String choicePeformance = scanner.nextLine().toUpperCase();
            if (choicePeformance.equals("Y")){
                Storage score = new StorageCreator().getStorage("score");
                score.retrieve(1);
            }
            if(choiceRepeat == "" || choiceRepeat.equals("N")) break; //end game if user inputs nothing
        }

        //we are done with the game! So, summarize all the play that has transpired and exit.
        this.gameStats.summarizeGame();
        System.out.println("\nThanks for playing!");
    }

    /* 
     * Play a round of Boggle.
     * This initializes the main objects: the board, the dictionary, the map of all
     * words on the board, and the set of words found by the user. These objects are
     * passed by reference from here to many other functions.
     */
    public void playRound(int size, String letters){
        //step 1. initialize the grid
        BoggleGrid grid = new BoggleGrid(size);
        grid.initalizeBoard(letters);
        //step 2. initialize the dictionary of legal words
        Dictionary boggleDict = new Dictionary("wordlist.txt"); //you may have to change the path to the wordlist, depending on where you place it.
        //step 3. find all legal words on the board, given the dictionary and grid arrangement.
        Map<String, ArrayList<Position>> allWords = new HashMap<String, ArrayList<Position>>();
        findAllWords(allWords, boggleDict, grid);
        //step 4. allow the user to try to find some words on the grid
        humanMove(grid, allWords);
        //step 5. allow the computer to identify remaining words
        computerMove(allWords);
    }

    /*
     * This method should return a String of letters (length 16 or 25 depending on the size of the grid).
     * There will be one letter per grid position, and they will be organized left to right,
     * top to bottom. A strategy to make this string of letters is as follows:
     * -- Assign a one of the dice to each grid position (i.e. dice_big_grid or dice_small_grid)
     * -- "Shuffle" the positions of the dice to randomize the grid positions they are assigned to
     * -- Randomly select one of the letters on the given die at each grid position to determine
     *    the letter at the given position
     *
     * @return String a String of random letters (length 16 or 25 depending on the size of the grid)
     */
    private String randomizeLetters(int size){
        String letters = "";
        if (size == 4) {
            List<String> dices = new LinkedList<String>(Arrays.asList(this.dice_small_grid));
            for (int i = 0; i < 16; i++) {
                int randDice = (int)(Math.random() * (dices.size()));
                int randLetter = (int)(Math.random() * (6));
                letters += dices.get(randDice).charAt(randLetter);
                dices.remove(randDice);
            }
        } else if (size == 5) {
            List<String> dices = new LinkedList<String>(Arrays.asList(this.dice_big_grid));
            for (int i = 0; i < 25; i++) {
                int randDice = (int)(Math.random() * (dices.size()));
                int randLetter = (int)(Math.random() * (6));
                letters += dices.get(randDice).charAt(randLetter);
                dices.remove(randDice);
            }
        } return letters;
    }

    /* 
     * This should be a recursive function that finds all valid words on the boggle board.
     * Every word should be valid (i.e. in the boggleDict) and of length 4 or more.
     * Words that are found should be entered into the allWords HashMap.  This HashMap
     * will be consulted as we play the game.
     *
     * Note that this function will be a recursive function.  You may want to write
     * a wrapper for your recursion. Note that every legal word on the Boggle grid will correspond to
     * a list of grid positions on the board, and that the Position class can be used to represent these
     * positions. The strategy you will likely want to use when you write your recursion is as follows:
     * -- At every Position on the grid:
     * ---- add the Position of that point to a list of stored positions
     * ---- if your list of stored positions is >= 4, add the corresponding word to the allWords Map
     * ---- recursively search for valid, adjacent grid Positions to add to your list of stored positions.
     * ---- Note that a valid Position to add to your list will be one that is either horizontal, diagonal, or
     *      vertically touching the current Position
     * ---- Note also that a valid Position to add to your list will be one that, in conjunction with those
     *      Positions that precede it, form a legal PREFIX to a word in the Dictionary (this is important!)
     * ---- Use the "isPrefix" method in the Dictionary class to help you out here!!
     * ---- Positions that already exist in your list of stored positions will also be invalid.
     * ---- You'll be finished when you have checked EVERY possible list of Positions on the board, to see
     *      if they can be used to form a valid word in the dictionary.
     * ---- Food for thought: If there are N Positions on the grid, how many possible lists of positions
     *      might we need to evaluate?
     *
     * @param allWords A mutable list of all legal words that can be found, given the boggleGrid grid letters
     * @param boggleDict A dictionary of legal words
     * @param boggleGrid A boggle grid, with a letter at each position on the grid
     */
    private void findAllWords(Map<String,ArrayList<Position>> allWords, Dictionary boggleDict, BoggleGrid boggleGrid) {
        ArrayList<ArrayList<Position>> wordList = new ArrayList<ArrayList<Position>>();
        List<Position> positions = new ArrayList<>();
        for (int i = 0; i < boggleGrid.numRows(); i++){
            for (int j = 0; j < boggleGrid.numCols(); j++){
                positions.add(new Position(i, j));
                wordList.addAll(findWords(positions, boggleDict, boggleGrid));
                positions.clear();
            }
        }

        for (int i = 0; i < wordList.size(); i++) {
            ArrayList<Position> word = wordList.get(i);
            if (word.size() >= 4) {
                allWords.put(positionToWord(word, boggleGrid), word);
            }
        }
    }

    private ArrayList<ArrayList<Position>> findWords(List<Position> positions, Dictionary boggleDict, BoggleGrid boggleGrid) {
        ArrayList foundWords = new ArrayList<>();

        int newRow = positions.get(positions.size() - 1).getRow() -1;
        int newCol = positions.get(positions.size() - 1).getCol();
        Position newPosition = new Position(newRow, newCol); // N
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow() +1;
        newCol = positions.get(positions.size() - 1).getCol();
        newPosition = new Position(newRow, newCol); // S
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow();
        newCol = positions.get(positions.size() - 1).getCol() +1;
        newPosition = new Position(newRow, newCol); // E
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow();
        newCol = positions.get(positions.size() - 1).getCol() -1;
        newPosition = new Position(newRow, newCol); // W
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow() -1;
        newCol = positions.get(positions.size() - 1).getCol() +1;
        newPosition = new Position(newRow, newCol); // NE
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow() -1;
        newCol = positions.get(positions.size() - 1).getCol() -1;
        newPosition = new Position(newRow, newCol); // NW
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow() +1;
        newCol = positions.get(positions.size() - 1).getCol() +1;
        newPosition = new Position(newRow, newCol); // SE
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }

        newRow = positions.get(positions.size() - 1).getRow() +1;
        newCol = positions.get(positions.size() - 1).getCol() -1;
        newPosition = new Position(newRow, newCol); // SW
        if (differentPosition(positions, newPosition) && newRow >= 0 && newCol >= 0 && newRow < boggleGrid.numRows() && newCol < boggleGrid.numCols()) {
            List<Position> test = new ArrayList<Position>(positions); test.add(newPosition);
            if (boggleDict.containsWord(positionToWord(test, boggleGrid))) {
                foundWords.add(test);
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            } else if (boggleDict.isPrefix(positionToWord(test, boggleGrid))) {
                foundWords.addAll(findWords(test, boggleDict, boggleGrid));
            }
        }
        return foundWords;
    }

    private String positionToWord(List<Position> positions, BoggleGrid boggleGrid) {
        String word = "";
        for (int i = 0; i < positions.size(); i++) {
            word += boggleGrid.getCharAt(positions.get(i).getRow(), positions.get(i).getCol());
        } return word;
    }

    private boolean differentPosition(List<Position> positions, Position newPosition) {
        for (int i = 0; i < positions.size(); i++) {
            Position currentPosition = positions.get(i);
            int currentRow = currentPosition.getRow();
            int currentCol = currentPosition.getCol();
            int newRow = newPosition.getRow();
            int newCol = newPosition.getCol();
            if (currentRow == newRow && currentCol == newCol) {return false;}
        } return true;
    }

    /* 
     * Gets words from the user.  As words are input, check to see that they are valid.
     * If yes, add the word to the player's word list (in boggleStats) and increment
     * the player's score (in boggleStats).
     * End the turn once the user hits return (with no word).
     *
     * @param board The boggle board
     * @param allWords A mutable list of all legal words that can be found, given the boggleGrid grid letters
     */
    private void humanMove(BoggleGrid board, Map<String,ArrayList<Position>> allWords){
        System.out.println("It's your turn to find some words " + this.playerList.name + "!" );
        boolean notDone = true;
        while(notDone) {
            //step 1. Print the board for the user, so they can scan it for words
            System.out.println(board);

            //step 2. Get an input (a word) from the user via the console
            if (this.numPlayers == 1) {
                System.out.print("Enter Found Word ||| Enter S To Save Game ||| Press Enter To End Turn: ");
            }
            else {
                System.out.println("It's your turn to find some words " + this.playerList.name + "!" );
                System.out.print("Enter Found Word or PASS (case sensative): "); }
            String foundWord = scanner.nextLine().toUpperCase();

            //step 3. Check to see if it is valid (note validity checks should be case-insensitive)
            if (foundWord.equals("S")){
                String playerWords = gameStats.getPlayerWords().toString();
                List<String> saveData = Arrays.asList(playerWords.substring(1, playerWords.length() -1), board.toString());
                ((new StorageCreator()).getStorage("game")).save(saveData);
            } else if (foundWord.equals("PASS")) {
                this.playerList = this.playerList.getNext();
            } else if (foundWord.equals("")) {notDone = false;}
            else if (foundWord.length() >= 4 && allWords.containsKey(foundWord) &&
                    gameStats.getPlayerWords().contains(foundWord) == false) {
                gameStats.addWord(foundWord, BoggleStats.Player.Human);
                this.playerList = this.playerList.getNext();
                System.out.println("Nice, You Scored " + (foundWord.length() - 3) + " Point(s)!");
            } else {System.out.println("Invalid Input '" + foundWord + "', Try Again!");}
        }
    }


    /* 
     * Gets words from the computer.  The computer should find words that are
     * both valid and not in the player's word list.  For each word that the computer
     * finds, update the computer's word list and increment the
     * computer's score (stored in boggleStats).
     *
     * @param allWords A mutable list of all legal words that can be found, given the boggleGrid grid letters
     */
    private void computerMove(Map<String,ArrayList<Position>> all_words){
        List<String> words = new ArrayList<String>(all_words.keySet());
        for (int i = 0; i < words.size(); i++) {
            String word = words.get(i);
            if (!gameStats.getPlayerWords().contains(word)) {
                gameStats.addWord(word, BoggleStats.Player.Computer);
            }
        }
    }

}
