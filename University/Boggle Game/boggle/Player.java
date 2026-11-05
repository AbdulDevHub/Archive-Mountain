package boggle;

import java.util.HashSet;

public class Player {

    public int score;


    public String name;


    /**
     * The next Player object
     */

    private Player next;

    /**
     * The list of words found by this player
     */
    private HashSet<String> words;

    /**
     * The average number of words found per round
     */
    private float averageWords;


    /**
     * The total score across all rounds
     */
    private int totalScore;

    public Player(int playerNum) {
        this.score = 0;
        this.totalScore = 0;
        this.name = "Player " + playerNum;
        this.words = new HashSet<String>();
        this.averageWords = 0;
    }

    /**
     *  Creates numPlayers new Player objects and links them together
     * @param numPlayers
     * @return the starting player
     */

    public static Player generatePlayers(int numPlayers) {
        Player root = new Player(1);
        Player curr = root;
        for (int i = 2; i <= numPlayers; i++) {
            Player prev = curr;
            curr = new Player(i);
            prev.next = curr;
        }

        curr.next = root;
        return root;
    }

    public void addWord(String word){
        this.words.add(word);
        this.score += word.length() - 3;
    }


    public Player getNext() {
        return this.next;
    }

    public HashSet<String> getWords(){
        return this.words;
    }

    private void clearWords(){
        this.words.clear();
    }

    public void getStats(int round){
        this.averageWords = (this.averageWords * round + this.words.size()) / (round + 1);
        this.totalScore += this.score;
        System.out.println(this.name + " found words" + this.words);
        System.out.println("");
        System.out.println("Number of words (" + this.name + "):" + this.words.size());
        System.out.println("");
        System.out.println(this.name + " score:" + this.score);
        System.out.println("");
        clearWords();
        this.score = 0;
    }

    public void endStats() {
        System.out.println("Average number of words (" + this.name + "):" + this.averageWords);
        System.out.println("");
        System.out.println("Total " + this.name + " score:" + this.totalScore);
        System.out.println("");
    }
}
