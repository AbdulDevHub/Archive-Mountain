package lab04;

import java.io.*;

import lab04.BrailleLetterException;

import java.util.*;


/**
 * BrailleTranslator class.  A class to translate ASCII to Braille.
 **/
public class BrailleTranslator {

    /**
     * List containing a Braille Translation
     */
    List<List<String>> translation; 
    /**
     * Map to translate characters to Braille
     */
    Map<Character, List<String>> map;

    /**
     * Create a BrailleTranslator.
     */
    public BrailleTranslator() throws IOException {
        this.translation = new ArrayList<List<String>>();
        this.map = new HashMap<>();
        initializeMap();
    }

    /**
     * Print the translation
     *
     * @return String that includes entire translation stored in translation attribute
     */
    public String toString() {
        String retval = "";
        for (List<String> l: this.translation) {
            retval += l.get(0) + "\n" + l.get(1) + "\n" + l.get(2); //three rows for every one line
            retval += "\n";

        }
        return retval;
    }

    /**
     * Getter method for map.
     *
     * @return the map used for translation
     */
    public Map<Character, List<String>> getMap() {
        return this.map;
    }


    /**
     * Initialize a map to turn ASCII characters into Braille letters.
     * Read in the file "dictionary.txt" and use it to initialize 
     * the map attribute.  This will be used to translate each ASCII
     * character to a list of strings (e.g. a -> {"10", "00", "00"})
     *
     * @throws IOException if file cannot be accessed
     */
    private void initializeMap() throws IOException {
        try{
            File myObj = new File("dictionary.txt");
            Scanner myReader = new Scanner(myObj);

            String line = "";
            HashMap<Character, List<String>> characterMap = new HashMap<Character, List<String>>();
            while (myReader.hasNextLine()) {
                line = myReader.nextLine().replaceAll("\\s+","");
                if (line.charAt(0) == ','){line = " " + line;}
                List<String> characters = Arrays.asList(line.split(","));
                characterMap.put(characters.get(0).charAt(0), characters.subList(1, 4));
            }
            myReader.close();
            this.map = characterMap;
        } catch (IOException e) {throw new IOException("your message");}
    }

    /**
     * Translate an ASCII line to a line of Braille.
     * To translate a line, iterate over the line and translate each character.
     * Then, concatenate translated characters to form lines of Braille as List<String> objects.
     * (e.g. The string "ab" should result in -> {"1010", "0010", "0000"}.
     * This corresponds to character a ->  {"10", "00", "00"} concatenated with b ->  {"10", "10", "00"}).
     * Store each line in this.translation (which is a List of List<String> objects).
     *
     * @param input: the ASCII line of text to be translated.
     */
    public void translateLine(String input) throws BrailleLetterException {
        List<String> line = new ArrayList<String>();
        line.add(""); line.add(""); line.add("");
        for (int i = 0; i < input.length(); i++) {
            List<String> character = translateChar(Character.toLowerCase(input.charAt(i)));
            if (character.isEmpty()){
                this.translation.clear();
                throw new BrailleLetterException(input.charAt(i) + " is not in the set of translatable letters");
            }
            for (int j = 0; j < character.size(); j++){
                line.set(j, line.get(j) + character.get(j));
            }
        }
        this.translation.add(line);
    }


    /**
     * Translate an ASCII character to a single Braille letter with positions as follows
     *      0 3
     *      1 4
     *      2 5
     *
     * Each position should contain a zero or a one.
     *
     * @param c: the ASCII character to be translated.
     * @return a Braille character translation
     */
    public List<String> translateChar(char c) {
        if (this.map.containsKey(c)){return getMap().get(c);}
        return new ArrayList<String>();
    }
}
